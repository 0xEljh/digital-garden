import React, { useEffect, useState, useMemo } from "react";
import { Box } from "@chakra-ui/react";
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
      {rows.map((row, index) => (
        <FlickerRow key={index} row={row} />
      ))}
    </Box>
  );
};


// The FlickerRow component randomly chooses a flicker style per row.
const FlickerRow = ({ row }: { row: string }) => {
  // Randomly select a flicker effect ("opacity" vs "hash") only once per row.
  const { flickerType, delay, intensity } = useMemo(() => ({
    flickerType: Math.random() < 0.98 ? "opacity" : "hash",
    delay: Math.random() * 0.8 + 10, // Shorter delay range for tighter sync
    intensity: Math.random() * 2 + 1 // Intensity multiplier for variations
  }), []);

  const flickerEase = cubicBezier(0.5, 0, 0.75, 0);

  // Simple opacity and horizontal shift flicker.
  if (flickerType === "opacity") {
    return (
      <motion.div
        animate={{ opacity: [1, 0.9, 1], x: [`${intensity * -0.5}px`, 0, `${intensity * 0.5}px`, 0]  }}
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