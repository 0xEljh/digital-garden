import React, { useEffect, useState, useMemo } from "react";
import { Box, Text } from "@chakra-ui/react";
import { motion, cubicBezier, steps } from "motion/react";
import { convertImageToAscii } from "../../lib/utils/asciiConverter";

interface AsciiImageProps {
  imagePath: string;
  // Desired width (number of characters). The height will be auto-calculated based on the image aspect ratio.
  width?: number;
  sampleFactor?: number;
  // Font size for rendering; effectively the size of each pixel
  fontSize?: string;
}

export const AsciiImage = ({
  imagePath,
  width = 100,
  sampleFactor = 4,
  fontSize = "8px",
}: AsciiImageProps) => {
  const [asciiArt, setAsciiArt] = useState<string>("");

  useEffect(() => {
    const image = new Image();
    image.src = imagePath;
    image.crossOrigin = "Anonymous";

    image.onload = async () => {
      try {
        const ascii = await convertImageToAscii(image, {
          width,
          sampleFactor,
        });
        setAsciiArt(ascii);
      } catch (err) {
        console.error("Error converting image to ASCII:", err);
      }
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


export const FlickeringAsciiImage = ({
  imagePath,
  width = 100,
  sampleFactor = 4,
  fontSize = "8px",
}: AsciiImageProps) => {
  const [asciiArt, setAsciiArt] = useState<string>("");
  const rows = asciiArt.split("\n");

  useEffect(() => {
    const image = new Image();
    image.src = imagePath;
    image.crossOrigin = "Anonymous";

    image.onload = async () => {
      try {
        const ascii = await convertImageToAscii(image, {
          width,
          sampleFactor,
        });
        setAsciiArt(ascii);
      } catch (err) {
        console.error("Error converting image to ASCII:", err);
      }
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
      fontSize={fontSize}
    >
      {rows.map((row, index) => {
        // if (index < rows.length / 2) {
        //   return (
        //     <Text key={index}>{row}</Text>
        //   )
        // }
        return (
          <FlickerRow key={index} row={row} />
        )
      }
      )}
    </Box>
  );
};


// The FlickerRow component randomly chooses a flicker style per row.
const FlickerRow = ({ row }: { row: string }) => {
  // Randomly select a flicker effect ("opacity" vs "hash") only once per row.
  const { flickerType, delay, intensity } = useMemo(() => ({
    flickerType: Math.random() < 0.98 ? "opacity" : "hash",
    delay: Math.random() * 0.8 + 5, // Shorter delay range for tighter sync
    intensity: Math.random() * 2 + 1 // Intensity multiplier for variations
  }), []);

  const flickerEase = cubicBezier(0.5, 0, 0.75, 0);

  // Simple opacity and horizontal shift flicker.
  if (flickerType === "opacity") {
    return (
      <motion.div
        animate={{ opacity: [1, 0.9, 1], x: [`${intensity * -0.5}px`, 0, `${intensity * 0.5}px`, 0] }}
        transition={{
          duration: 0.12 * intensity,
          repeat: Infinity,
          repeatType: "mirror",
          ease: flickerEase,
          delay
        }}
      >
        {row}
      </motion.div>
    );
  }

  // "Hash" effect: animate between the original row and a row of '#' characters.
  // We use two overlapping spans whose opacities are animated in opposite phases.
  const hashRow = "/".repeat(row.length);
  return (
    <div style={{ position: "relative", display: "block" }}>
      <motion.span
        style={{ position: "absolute", top: 0, left: 0 }}
        animate={{ opacity: [1, 0, 1, 0, 1] }}
        transition={{
          duration: 0.15,
          repeat: Infinity,
          ease: steps(2),
          delay
        }}
      >
        {row}
      </motion.span>
      <motion.span
        style={{ position: "absolute", top: 0, left: 0 }}
        animate={{
          opacity: [0, 1, 0],
          x: [`${intensity * -1}px`, 0, `${intensity}px`]
        }}
        transition={{
          duration: 0.1,
          repeat: Infinity,
          ease: "linear",
          delay: delay + 0.05
        }}
      >
        {hashRow}
      </motion.span>
      <span style={{ visibility: "hidden" }}>{row}</span>
    </div>
  );
};



interface HighlightableAsciiImageProps {
  imagePath: string;
  maskPath: string;
  // Desired width (number of characters). The height will be auto-calculated based on the image aspect ratio.
  width?: number;
  sampleFactor?: number;
  // Font size for rendering; effectively the size of each pixel
  fontSize?: string;
  // Toggle to enable/disable highlighting
  highlightEnabled?: boolean;
  // Colour to use for the highlight
  highlightColor?: string;
  // Threshold for determining if a cell is highlighted (0–255)
  highlightThreshold?: number;
}

export const HighlightableAsciiImage = ({
  imagePath,
  maskPath,
  width = 100,
  sampleFactor = 4,
  fontSize = "8px",
  highlightEnabled = true,
  highlightColor = "yellow",
  highlightThreshold = 128,
}: HighlightableAsciiImageProps) => {
  const [asciiArt, setAsciiArt] = useState<string>("");
  // A grid (2D boolean array) representing whether each ascii cell should be highlighted.
  const [highlightGrid, setHighlightGrid] = useState<boolean[][]>([]);

  // Generate ASCII art from the main image.
  useEffect(() => {
    const image = new Image();
    image.src = imagePath;
    image.crossOrigin = "Anonymous";

    image.onload = async () => {
      try {
        const ascii = await convertImageToAscii(image, { width, sampleFactor });
        setAsciiArt(ascii);
      } catch (err) {
        console.error("Error converting image to ASCII:", err);
      }
    };

    image.onerror = (err) => {
      console.error("Error loading image", err);
    };
  }, [imagePath, width, sampleFactor]);

  // Once asciiArt is computed, load the mask image and compute the highlight grid.
  useEffect(() => {
    if (!asciiArt) return;
    const rows = asciiArt.split("\n");
    const asciiHeight = rows.length;
    // Assuming all rows have the same length.
    const asciiWidth = rows[0]?.length || 0;

    const maskImage = new Image();
    maskImage.src = maskPath;
    maskImage.crossOrigin = "Anonymous";
    maskImage.onload = () => {
      // Create a canvas with dimensions equal to the ascii grid.
      const canvas = document.createElement("canvas");
      canvas.width = asciiWidth;
      canvas.height = asciiHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw the mask image scaled to the ascii grid size.
      ctx.drawImage(maskImage, 0, 0, asciiWidth, asciiHeight);
      const imageData = ctx.getImageData(0, 0, asciiWidth, asciiHeight);
      const data = imageData.data;

      const grid: boolean[][] = [];
      for (let y = 0; y < asciiHeight; y++) {
        const rowHighlights: boolean[] = [];
        for (let x = 0; x < asciiWidth; x++) {
          const offset = (y * asciiWidth + x) * 4;
          const r = data[offset];
          const g = data[offset + 1];
          const b = data[offset + 2];
          // Compute brightness using the standard formula.
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
          rowHighlights.push(brightness >= highlightThreshold);
        }
        grid.push(rowHighlights);
      }
      setHighlightGrid(grid);
    };

    maskImage.onerror = (err) => {
      console.error("Error loading mask image", err);
    };
  }, [maskPath, asciiArt, highlightThreshold]);

  // To render efficiently, we group contiguous characters in each row that share the same highlight state.
  const renderRow = (row: string, rowIndex: number) => {
    // If no grid is available, just render the row.
    if (!highlightGrid[rowIndex] || highlightGrid[rowIndex].length !== row.length) {
      return <span>{row}</span>;
    }

    const segments: { text: string; highlight: boolean }[] = [];
    let currentSegment = "";
    let currentHighlight = highlightGrid[rowIndex][0];

    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const char = row[colIndex];
      const cellHighlight = highlightGrid[rowIndex][colIndex];
      if (cellHighlight === currentHighlight) {
        currentSegment += char;
      } else {
        segments.push({ text: currentSegment, highlight: currentHighlight });
        currentSegment = char;
        currentHighlight = cellHighlight;
      }
    }
    if (currentSegment) segments.push({ text: currentSegment, highlight: currentHighlight });

    return segments.map((seg, i) => (
      <span
        key={i}
        style={{
          color: highlightEnabled && seg.highlight ? highlightColor : "inherit",
          transition: "color 0.3s ease-in-out",
        }}
      >
        {seg.text}
      </span>
    ));
  };

  const rows = asciiArt.split("\n");

  return (
    <Box
      as="pre"
      fontFamily="Aeion Mono"
      whiteSpace="pre"
      p={4}
      overflow="auto"
      fontSize={fontSize}
    >
      {rows.map((row, rowIndex) => (
        <div key={rowIndex}>{renderRow(row, rowIndex)}</div>
      ))}
    </Box>
  );
};