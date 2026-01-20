// Maps a brightness value (0–255) to a character in the asciiChars string.
const asciiChars = " '.,:;+=?*/#%$@";

const mapBrightnessToChar = (brightness: number): string => {
  const index = Math.floor((brightness / 255) * (asciiChars.length - 1));
  return asciiChars[index];
};

export interface AsciiConversionOptions {
  width?: number;
  sampleFactor?: number;
  cellAspect?: number;
}

export const convertImageToAscii = async (
  image: HTMLImageElement,
  options: AsciiConversionOptions = {}
): Promise<string> => {
  const { width = 100, sampleFactor = 4, cellAspect = 0.4 } = options;

  // Calculate ASCII dimensions (in characters)
  const asciiWidth = Math.max(1, Math.floor(width));
  const asciiHeight = Math.max(
    1,
    Math.floor(asciiWidth * (image.height / image.width) * cellAspect)
  );

  // Historically sampleFactor meant "pixels sampled per ASCII cell".
  // We now do averaging via canvas scaling (much faster than manual JS loops),
  // but keep sampleFactor as an optional oversampling hint.
  const oversample = Math.max(1, Math.min(12, Math.floor(sampleFactor)));

  const canvas = document.createElement("canvas");
  canvas.width = asciiWidth;
  canvas.height = asciiHeight;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (oversample > 1) {
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = asciiWidth * oversample;
    tmpCanvas.height = asciiHeight * oversample;

    const tmpCtx = tmpCanvas.getContext("2d");
    if (!tmpCtx) {
      throw new Error("Could not get canvas context");
    }

    tmpCtx.imageSmoothingEnabled = true;
    tmpCtx.imageSmoothingQuality = "high";

    // Draw the image at a higher resolution first...
    tmpCtx.drawImage(image, 0, 0, tmpCanvas.width, tmpCanvas.height);

    // ...then downscale to the ASCII grid. This offloads averaging to the browser.
    ctx.drawImage(tmpCanvas, 0, 0, asciiWidth, asciiHeight);
  } else {
    // Directly draw scaled to the ASCII grid.
    ctx.drawImage(image, 0, 0, asciiWidth, asciiHeight);
  }

  const data = ctx.getImageData(0, 0, asciiWidth, asciiHeight).data;

  const rows: string[] = new Array(asciiHeight);

  for (let y = 0; y < asciiHeight; y++) {
    let row = "";
    const rowOffset = y * asciiWidth * 4;

    for (let x = 0; x < asciiWidth; x++) {
      const offset = rowOffset + x * 4;
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
