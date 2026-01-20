import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const asciiChars = " '.,:;+=?*/#%$@";

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
