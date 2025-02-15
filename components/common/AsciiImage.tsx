import React, { useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";

// after playing around with a few character sets, this seems to be the most 'balanced' in terms
// of steps from light to dark
const asciiChars = " '.,:;+=?*/#%$@";
// Maps a brightness value (0–255) to a character in the asciiChars string.
const mapBrightnessToChar = (brightness: number): string => {
  const index = Math.floor((brightness / 255) * (asciiChars.length - 1));
  return asciiChars[index];
};

interface ImageToAsciiProps {
  imagePath: string;
  // Desired width (number of characters). The height will be auto-calculated based on the image aspect ratio.
  width?: number;
  sampleFactor?: number;
  // Font size for rendering; effectively the size of each pixel
  fontSize?: string;
}

export const ImageToAscii = ({
  imagePath,
  width = 100,
  sampleFactor = 4,
  fontSize = "8px",
}: ImageToAsciiProps) => {
  const [asciiArt, setAsciiArt] = useState<string>("");

  useEffect(() => {
    const image = new Image();
    image.src = imagePath;
    image.crossOrigin = "Anonymous";

    image.onload = () => {
      // Correction factor to adjust formonospaced character proportions.
      const cellAspect = 0.42;

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
        console.error("Could not get canvas context");
        return;
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
      setAsciiArt(ascii);
    };

    image.onerror = (err) => {
      console.error("Error loading image", err);
    };
  }, [imagePath, width, sampleFactor]);

  return (
    <Box
      as="pre"
      fontFamily="Aeion Mono"
      whiteSpace="pre"
      p={4}
      overflow="auto"
      color="fg.muted"
      fontSize={fontSize} // font size -> effective resolution / pixel density
    >
      {asciiArt}
    </Box>
  );
};
