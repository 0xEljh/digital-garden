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
  const {
    width = 100,
    sampleFactor = 4,
    cellAspect = 0.42,
  } = options;

  // Calculate ASCII dimensions (in characters)
  const asciiWidth = width;
  const asciiHeight = Math.floor(
    asciiWidth * (image.height / image.width) * cellAspect
  );

  // The offscreen canvas will be larger to allow for denser sampling.
  const canvasWidth = asciiWidth * sampleFactor;
  const canvasHeight = asciiHeight * sampleFactor;

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  // Draw the image into the canvas at a higher resolution.
  ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);
  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const data = imageData.data;

  let ascii = "";

  // Process each ASCII cell
  for (let j = 0; j < asciiHeight; j++) {
    for (let i = 0; i < asciiWidth; i++) {
      let totalBrightness = 0;
      let totalAlpha = 0;
      // Loop over each pixel in the current cell.
      for (let y = 0; y < sampleFactor; y++) {
        for (let x = 0; x < sampleFactor; x++) {
          const pixelX = i * sampleFactor + x;
          const pixelY = j * sampleFactor + y;
          const offset = (pixelY * canvasWidth + pixelX) * 4;
          const r = data[offset];
          const g = data[offset + 1];
          const b = data[offset + 2];
          const a = data[offset + 3];
          totalAlpha += a;
          // Only add brightness if the pixel isn't fully transparent.
          if (a !== 0) {
            totalBrightness += 0.299 * r + 0.587 * g + 0.114 * b;
          }
        }
      }
      const totalPixels = sampleFactor * sampleFactor;
      // If the entire cell is transparent, output a space.
      if (totalAlpha === 0) {
        ascii += " ";
      } else {
        const avgBrightness = totalBrightness / totalPixels;
        ascii += mapBrightnessToChar(avgBrightness);
      }
    }
    ascii += "\n";
  }
  return ascii;
};
