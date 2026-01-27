import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const asciiChars = " '.,:;+=?*/#%$@";

// Portfolio icon configurations - must match lib/ascii-icon-factory.tsx
const ICON_CONFIGS = {
  LightSabreIcon: {
    imagePath: "/images/lightsabre.jpg",
    widthDivisor: 2,
  },
  PostQuantumEncryptionIcon: {
    imagePath: "/images/post-quantum-encryption.jpg",
  },
  DreamboothIcon: {
    imagePath: "/images/dreambooth.jpg",
  },
  CryptoChartIcon: {
    imagePath: "/images/crypto-candlestick-charts.jpg",
  },
  CandlestickChartIcon: {
    imagePath: "/images/candlestick-charts.jpg",
  },
  UnderTheRockIcon: {
    imagePath: "/images/under-the-rock.jpg",
    widthDivisor: 2,
  },
  ETHTokyo23Icon: {
    imagePath: "/images/ethtokyo23-square.jpg",
  },
  EdgeAIIcon: {
    imagePath: "/images/edge-ai.jpg",
  },
  MaritimeSatelliteIcon: {
    imagePath: "/images/maritime-satellite.jpg",
  },
  DegenLogoIcon: {
    imagePath: "/images/degen-logo.jpg",
  },
  BattleBotIcon: {
    imagePath: "/images/edhbattlebot.jpg",
  },
  AirdropIcon: {
    imagePath: "/images/airdrop.jpg",
  },
  BacksimIcon: {
    imagePath: "/images/backsim.jpg",
  },
  TeatheGatheringLogoIcon: {
    imagePath: "/images/teathegathering.jpg",
  },
  VampTutorIcon: {
    imagePath: "/images/vamp-tutor.jpg",
  },
};

// Default width used in portfolio-card.tsx
const PORTFOLIO_ICON_WIDTH = 220;

const mapBrightnessToChar = (brightness) => {
  const index = Math.floor((brightness / 255) * (asciiChars.length - 1));
  return asciiChars[index];
};

const imageToAscii = async ({ inputPath, width, cellAspect = 0.4 }) => {
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

  for (let y = 0; y < info.height; y++) {
    let row = "";
    const rowOffset = y * info.width * info.channels;

    for (let x = 0; x < info.width; x++) {
      const offset = rowOffset + x * info.channels;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const a = data[offset + 3];

      if (a === 0) {
        row += " ";
        continue;
      }

      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      row += mapBrightnessToChar(brightness);
    }

    rows[y] = row;
  }

  return rows.join("\n");
};

const main = async () => {
  const repoRoot = process.cwd();

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
    // eslint-disable-next-line no-console
    console.log(`[ascii] generating hero width=${w}`);
    // eslint-disable-next-line no-await-in-loop
    const ascii = await imageToAscii({ inputPath: heroInput, width: w, cellAspect: 0.4 });
    assets.hero.widths[w] = ascii;
  }

  // Generate portfolio icons
  assets.portfolioIcons = {};

  for (const [iconName, config] of Object.entries(ICON_CONFIGS)) {
    const widthDivisor = config.widthDivisor || 1;
    const effectiveWidth = PORTFOLIO_ICON_WIDTH / widthDivisor;

    // Handle both /images/... and images/... paths
    const imagePath = config.imagePath.startsWith("/")
      ? config.imagePath.slice(1)
      : config.imagePath;
    const inputPath = path.join(repoRoot, "public", imagePath);

    // eslint-disable-next-line no-console
    console.log(`[ascii] generating ${iconName} width=${effectiveWidth}`);

    try {
      // eslint-disable-next-line no-await-in-loop
      const ascii = await imageToAscii({
        inputPath,
        width: effectiveWidth,
        cellAspect: 0.4,
      });

      assets.portfolioIcons[iconName] = {
        ascii,
        width: PORTFOLIO_ICON_WIDTH,
        effectiveWidth,
      };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[ascii] failed to generate ${iconName}: ${err.message}`);
    }
  }

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outFile, JSON.stringify(assets, null, 2) + "\n", "utf8");

  // eslint-disable-next-line no-console
  console.log(`[ascii] wrote ${path.relative(repoRoot, outFile)}`);
};

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
