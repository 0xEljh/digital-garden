import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const asciiChars = " '.,:;+=?*/#%$@";

// Default width used in portfolio-card.tsx
const PORTFOLIO_ICON_WIDTH = 220;

const HIGHLIGHT_DEFAULTS = {
  chromaThreshold: 40,
  dilationBrightness: 220,
  dilationIterations: 2,
  maskThreshold: 128,
  minCoverage: 0.02,
  maxCoverage: 0.7,
};

let sharpModulePromise;

const loadSharp = async () => {
  sharpModulePromise ??= import("sharp");
  const sharpModule = await sharpModulePromise;
  return sharpModule.default;
};

const loadIconConfigs = async (repoRoot) => {
  const configPath = path.join(repoRoot, "lib", "ascii-icon-config.json");
  const configJson = await fs.readFile(configPath, "utf8");
  return JSON.parse(configJson);
};

const mapBrightnessToChar = (brightness) => {
  const index = Math.floor((brightness / 255) * (asciiChars.length - 1));
  return asciiChars[index];
};

const getPublicAssetPath = (repoRoot, assetPath) => {
  const relativePath = assetPath.startsWith("/") ? assetPath.slice(1) : assetPath;
  return path.join(repoRoot, "public", relativePath);
};

const createCell = ({ char, r, g, b, a }) => {
  const brightness = a === 0 ? 0 : 0.299 * r + 0.587 * g + 0.114 * b;

  return {
    char,
    r,
    g,
    b,
    a,
    brightness,
    chroma: a === 0 ? 0 : Math.max(r, g, b) - Math.min(r, g, b),
  };
};

const imageToAsciiData = async ({ inputPath, width, cellAspect = 0.4 }) => {
  const sharp = await loadSharp();
  const image = sharp(inputPath);
  const meta = await image.metadata();
  if (!meta.width || !meta.height) {
    throw new Error(`Could not read image dimensions for: ${inputPath}`);
  }

  const asciiWidth = Math.max(1, Math.floor(width));
  const asciiHeight = Math.max(
    1,
    Math.floor(asciiWidth * (meta.height / meta.width) * cellAspect)
  );

  const { data, info } = await image
    .ensureAlpha()
    .resize(asciiWidth, asciiHeight, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rows = new Array(info.height);
  const cells = new Array(info.height);

  for (let y = 0; y < info.height; y++) {
    let row = "";
    const cellRow = new Array(info.width);
    const rowOffset = y * info.width * info.channels;

    for (let x = 0; x < info.width; x++) {
      const offset = rowOffset + x * info.channels;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const a = data[offset + 3];

      if (a === 0) {
        row += " ";
        cellRow[x] = createCell({ char: " ", r, g, b, a });
        continue;
      }

      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      const char = mapBrightnessToChar(brightness);
      row += char;
      cellRow[x] = createCell({ char, r, g, b, a });
    }

    rows[y] = row;
    cells[y] = cellRow;
  }

  return {
    ascii: rows.join("\n"),
    rows,
    cells,
    width: info.width,
    height: info.height,
  };
};

const imageToAscii = async (options) => {
  const { ascii } = await imageToAsciiData(options);
  return ascii;
};

const hasHighlightedNeighbor = (mask, y, x) => {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dy === 0 && dx === 0) continue;
      if (mask[y + dy]?.[x + dx]) return true;
    }
  }

  return false;
};

export const createAutoHighlightMask = (rows, cells, options = {}) => {
  const chromaThreshold = options.chromaThreshold ?? HIGHLIGHT_DEFAULTS.chromaThreshold;
  const dilationBrightness = options.dilationBrightness ?? HIGHLIGHT_DEFAULTS.dilationBrightness;
  const dilationIterations = options.dilationIterations ?? HIGHLIGHT_DEFAULTS.dilationIterations;

  const mask = rows.map((row, y) => Array.from(row, (char, x) => {
    const cell = cells[y]?.[x];
    return char !== " " && Boolean(cell) && cell.chroma >= chromaThreshold;
  }));

  for (let iteration = 0; iteration < dilationIterations; iteration++) {
    const previous = mask.map((row) => [...row]);
    let changed = false;

    for (let y = 0; y < mask.length; y++) {
      for (let x = 0; x < mask[y].length; x++) {
        if (previous[y][x]) continue;

        const cell = cells[y]?.[x];
        if (!cell || cell.brightness < dilationBrightness) continue;
        if (!hasHighlightedNeighbor(previous, y, x)) continue;

        mask[y][x] = true;
        changed = true;
      }
    }

    if (!changed) break;
  }

  return mask;
};

export const encodeHighlightSegments = (mask) => {
  const segments = [];

  mask.forEach((row, rowIndex) => {
    let startCol = null;

    for (let colIndex = 0; colIndex <= row.length; colIndex++) {
      const highlighted = row[colIndex] === true;

      if (highlighted && startCol === null) {
        startCol = colIndex;
      }

      if ((!highlighted || colIndex === row.length) && startCol !== null) {
        segments.push([rowIndex, startCol, colIndex]);
        startCol = null;
      }
    }
  });

  return segments;
};

const getHighlightCounts = (rows, mask) => {
  let nonSpaceCells = 0;
  let highlightedCells = 0;

  rows.forEach((row, y) => {
    Array.from(row).forEach((char, x) => {
      if (char === " ") return;

      nonSpaceCells += 1;
      if (mask[y]?.[x]) highlightedCells += 1;
    });
  });

  return { nonSpaceCells, highlightedCells };
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const rgbToHsl = ({ r, g, b }) => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const lightness = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: lightness };
  }

  const delta = max - min;
  const saturation = lightness > 0.5
    ? delta / (2 - max - min)
    : delta / (max + min);
  let hue;

  switch (max) {
    case rn:
      hue = (gn - bn) / delta + (gn < bn ? 6 : 0);
      break;
    case gn:
      hue = (bn - rn) / delta + 2;
      break;
    default:
      hue = (rn - gn) / delta + 4;
      break;
  }

  return { h: hue / 6, s: saturation, l: lightness };
};

const hueToRgb = (p, q, t) => {
  let hue = t;
  if (hue < 0) hue += 1;
  if (hue > 1) hue -= 1;
  if (hue < 1 / 6) return p + (q - p) * 6 * hue;
  if (hue < 1 / 2) return q;
  if (hue < 2 / 3) return p + (q - p) * (2 / 3 - hue) * 6;
  return p;
};

const hslToRgb = ({ h, s, l }) => {
  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hueToRgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, h) * 255),
    b: Math.round(hueToRgb(p, q, h - 1 / 3) * 255),
  };
};

const rgbToHex = ({ r, g, b }) => {
  const toHex = (value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const normalizeHighlightColor = (cells, mask) => {
  let weightedR = 0;
  let weightedG = 0;
  let weightedB = 0;
  let totalWeight = 0;
  const fallbackCells = [];

  mask.forEach((row, y) => {
    row.forEach((highlighted, x) => {
      if (!highlighted) return;

      const cell = cells[y]?.[x];
      if (!cell || cell.char === " ") return;

      fallbackCells.push(cell);

      if (cell.chroma <= 0) return;

      weightedR += cell.r * cell.chroma;
      weightedG += cell.g * cell.chroma;
      weightedB += cell.b * cell.chroma;
      totalWeight += cell.chroma;
    });
  });

  if (totalWeight === 0) {
    if (fallbackCells.length === 0) return "#ffffff";

    totalWeight = fallbackCells.length;
    weightedR = fallbackCells.reduce((sum, cell) => sum + cell.r, 0);
    weightedG = fallbackCells.reduce((sum, cell) => sum + cell.g, 0);
    weightedB = fallbackCells.reduce((sum, cell) => sum + cell.b, 0);
  }

  const meanRgb = {
    r: weightedR / totalWeight,
    g: weightedG / totalWeight,
    b: weightedB / totalWeight,
  };
  const hsl = rgbToHsl(meanRgb);
  const normalizedRgb = hslToRgb({
    h: hsl.h,
    s: Math.max(hsl.s, 0.7),
    l: clamp(hsl.l, 0.5, 0.65),
  });

  return rgbToHex(normalizedRgb);
};

export const buildHighlightFromCells = ({
  rows,
  cells,
  config = {},
  mode = "auto",
  mask,
  iconName = "icon",
  warn = console.warn,
}) => {
  const highlightMask = mode === "auto"
    ? createAutoHighlightMask(rows, cells, config)
    : mask;

  if (!highlightMask) {
    throw new Error(`Missing highlight mask for ${iconName}`);
  }

  const { nonSpaceCells, highlightedCells } = getHighlightCounts(rows, highlightMask);
  const coverage = nonSpaceCells === 0 ? 0 : highlightedCells / nonSpaceCells;
  const minCoverage = config.minCoverage ?? HIGHLIGHT_DEFAULTS.minCoverage;
  const maxCoverage = config.maxCoverage ?? HIGHLIGHT_DEFAULTS.maxCoverage;
  const stats = {
    mode,
    coverage,
    highlightedCells,
    nonSpaceCells,
    color: null,
  };

  if (mode === "auto" && (coverage < minCoverage || coverage > maxCoverage)) {
    warn(
      `[ascii] skipped highlight for ${iconName}: auto coverage ${(coverage * 100).toFixed(1)}% outside ${(
        minCoverage * 100
      ).toFixed(1)}%-${(maxCoverage * 100).toFixed(1)}%`
    );

    return { highlight: null, skipped: true, stats };
  }

  if (mode === "mask" && (coverage < minCoverage || coverage > maxCoverage)) {
    warn(
      `[ascii] explicit mask for ${iconName} has coverage ${(coverage * 100).toFixed(1)}% outside ${(
        minCoverage * 100
      ).toFixed(1)}%-${(maxCoverage * 100).toFixed(1)}%`
    );
  }

  const color = config.color ?? normalizeHighlightColor(cells, highlightMask);
  stats.color = color;

  return {
    highlight: {
      color,
      coverage: Number(coverage.toFixed(4)),
      segments: encodeHighlightSegments(highlightMask),
    },
    skipped: false,
    stats,
  };
};

const normalizeHighlightConfig = (highlight) => {
  if (!highlight) return null;
  if (highlight === "auto") return {};
  if (typeof highlight === "object" && !Array.isArray(highlight)) return highlight;

  throw new Error(`Invalid highlight config: ${JSON.stringify(highlight)}`);
};

const sampleMaskImage = async ({ inputPath, width, height, threshold }) => {
  const sharp = await loadSharp();
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .resize(width, height, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const mask = new Array(info.height);

  for (let y = 0; y < info.height; y++) {
    const row = new Array(info.width);
    const rowOffset = y * info.width * info.channels;

    for (let x = 0; x < info.width; x++) {
      const offset = rowOffset + x * info.channels;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      row[x] = brightness >= threshold;
    }

    mask[y] = row;
  }

  return mask;
};

const main = async () => {
  const repoRoot = process.cwd();
  const iconConfigs = await loadIconConfigs(repoRoot);

  const heroInput = path.join(repoRoot, "public", "emiya_kiritsugu-small.png");
  const outDir = path.join(repoRoot, "lib", "generated");
  const outFile = path.join(outDir, "ascii-assets.json");

  const widths = [140, 200, 300];

  const assets = {
    hero: {
      imagePath: "/emiya_kiritsugu-small.png",
      cellAspect: 0.4,
      widths: {},
    },
  };

  for (const w of widths) {
    console.log(`[ascii] generating hero width=${w}`);
    const ascii = await imageToAscii({ inputPath: heroInput, width: w, cellAspect: 0.4 });
    assets.hero.widths[w] = ascii;
  }

  // Generate portfolio icons
  assets.portfolioIcons = {};
  const highlightStats = [];

  for (const [iconName, config] of Object.entries(iconConfigs)) {
    const widthDivisor = config.widthDivisor || 1;
    const effectiveWidth = PORTFOLIO_ICON_WIDTH / widthDivisor;

    const inputPath = getPublicAssetPath(repoRoot, config.imagePath);

    console.log(`[ascii] generating ${iconName} width=${effectiveWidth}`);

    try {
      const asciiData = await imageToAsciiData({
        inputPath,
        width: effectiveWidth,
        cellAspect: 0.4,
      });

      const iconAsset = {
        ascii: asciiData.ascii,
        width: PORTFOLIO_ICON_WIDTH,
        effectiveWidth,
      };

      if (typeof config.fontSizeRatio === "number") {
        iconAsset.fontSizeRatio = config.fontSizeRatio;
      }

      const highlightConfig = normalizeHighlightConfig(config.highlight);
      if (highlightConfig) {
        const mode = highlightConfig.maskPath ? "mask" : "auto";
        const highlightMask = mode === "mask"
          ? await sampleMaskImage({
            inputPath: getPublicAssetPath(repoRoot, highlightConfig.maskPath),
            width: asciiData.width,
            height: asciiData.height,
            threshold: highlightConfig.maskThreshold ?? HIGHLIGHT_DEFAULTS.maskThreshold,
          })
          : undefined;
        const highlightResult = buildHighlightFromCells({
          rows: asciiData.rows,
          cells: asciiData.cells,
          config: highlightConfig,
          mode,
          mask: highlightMask,
          iconName,
        });

        highlightStats.push({
          iconName,
          ...highlightResult.stats,
          emitted: Boolean(highlightResult.highlight),
        });

        if (highlightResult.highlight) {
          iconAsset.highlight = highlightResult.highlight;
        }
      }

      assets.portfolioIcons[iconName] = iconAsset;
    } catch (err) {
      console.error(`[ascii] failed to generate ${iconName}: ${err.message}`);
    }
  }

  if (highlightStats.length > 0) {
    console.log("[ascii] highlight summary");
    for (const stat of highlightStats) {
      const color = stat.color ?? "none";
      const status = stat.emitted ? "emitted" : "skipped";
      console.log(
        `[ascii] highlight ${stat.iconName} mode=${stat.mode} coverage=${(stat.coverage * 100).toFixed(
          1
        )}% cells=${stat.highlightedCells}/${stat.nonSpaceCells} color=${color} ${status}`
      );
    }
  }

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outFile, JSON.stringify(assets, null, 2) + "\n", "utf8");

  console.log(`[ascii] wrote ${path.relative(repoRoot, outFile)}`);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
