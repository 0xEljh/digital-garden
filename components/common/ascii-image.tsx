import React, { useEffect, useState, useMemo, useRef } from "react";
import { Box, Text } from "@chakra-ui/react";
import { m, cubicBezier, steps, animate, MotionValue, useMotionValue, useTransform, motionValue } from "motion/react";
import { convertImageToAscii } from "../../lib/utils/asciiConverter";
import dynamic from "next/dynamic";

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
  sampleFactor = 2,
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
        return (
          <FlickerRow key={index} row={row} />
        )
      }
      )}
    </Box>
  );
};

const FlickerRow = ({ row }: { row: string }) => {
  const { flickerType, delay, intensity } = useMemo(() => ({
    flickerType: Math.random() < 0.98 ? "opacity" : "hash",
    delay: Math.random() * 0.8 + 5, // Shorter delay range for tighter sync
    intensity: Math.random() * 2 + 1 // Intensity multiplier for variations
  }), []);

  const flickerEase = cubicBezier(0.5, 0, 0.75, 0);

  if (flickerType === "opacity") {
    return (
      <m.div
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
      </m.div>
    );
  }

  const hashRow = "/".repeat(row.length);
  return (
    <div style={{ position: "relative", display: "block" }}>
      <m.span
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
      </m.span>
      <m.span
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
      </m.span>
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
  const [highlightGrid, setHighlightGrid] = useState<boolean[][]>([]);

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

  useEffect(() => {
    if (!asciiArt) return;
    const rows = asciiArt.split("\n");
    const asciiHeight = rows.length;
    const asciiWidth = rows[0]?.length || 0;

    const maskImage = new Image();
    maskImage.src = maskPath;
    maskImage.crossOrigin = "Anonymous";
    maskImage.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = asciiWidth;
      canvas.height = asciiHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

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

  const renderRow = (row: string, rowIndex: number) => {
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

interface ScrambledAsciiImageProps extends AsciiImageProps {
  scrambleAnimationDuration?: number; // Duration of animation in seconds
}

export const ScrambledAsciiImage = ({
  imagePath,
  width = 100,
  sampleFactor = 4,
  fontSize = "8px",
  scrambleAnimationDuration = 4,
}: ScrambledAsciiImageProps) => {
  const [asciiArt, setAsciiArt] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(true);
  const progressValue = motionValue(0);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);
  const rows = asciiArt.split("\n");

  // Characters to use for scrambling - we'll use a mix of special chars and letters
  const scrambleChars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  // Define a smooth easing curve with precise control points
  // Slow start, quick middle, gentle end
  const smoothEasing = cubicBezier(.32, .12, .68, .93);

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

        // Reset animation state
        setIsAnimating(true);
        progressValue.set(0);

        // @ts-expect-error Type '1' has no properties in common with type 'ObjectTarget<MotionValue<number>>' 
        animationRef.current = animate(progressValue, 1, {
          duration: scrambleAnimationDuration,
          easing: smoothEasing,
          repeat: 0,
        });
      } catch (err) {
        console.error("Error converting image to ASCII:", err);
      }
    };

    image.onerror = (err) => {
      console.error("Error loading image", err);
    };

    // Cleanup animation on unmount
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [imagePath, width, sampleFactor, progressValue]);

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
      {rows.map((row, rowIndex) => (
        <ScrambledRow
          key={rowIndex}
          row={row}
          isAnimating={isAnimating}
          progressValue={progressValue}
          scrambleChars={scrambleChars}
          rowIndex={rowIndex}
          totalRows={rows.length}
          smoothEasing={smoothEasing}
        />
      ))}
    </Box>
  );
};

// The ScrambledRow component handles the text scrambling animation for each row
const ScrambledRow = ({
  row,
  isAnimating,
  progressValue,
  scrambleChars,
  rowIndex,
  totalRows,
  smoothEasing
}: {
  row: string;
  isAnimating: boolean;
  progressValue: MotionValue<number>;
  scrambleChars: string;
  rowIndex: number;
  totalRows: number;
  smoothEasing: ReturnType<typeof cubicBezier>;
}) => {
  const [displayText, setDisplayText] = useState("");

  // Create a row-specific progress value that's derived from the main progress
  // but staggered based on the row position
  const staggerFactor = 0.4; // 40% of animation is staggered
  const rowPosition = totalRows > 1 ? rowIndex / (totalRows - 1) : 0;

  // Transform the main progress into a row-specific progress
  const rowProgressValue = useTransform(progressValue, (value) => {
    // Calculate staggered progress
    let rowProgress = value - (rowPosition * staggerFactor);

    // Scale to 0-1 range
    rowProgress = Math.max(0, Math.min(1, rowProgress / (1 - staggerFactor)));

    // Apply easing to row progress for even smoother motion
    return smoothEasing(rowProgress);
  });

  // Update display text whenever rowProgressValue changes
  useEffect(() => {
    const updateText = () => {
      if (!row) return "";

      // Get the current progress value
      const rowProgress = rowProgressValue.get();

      const newText = Array.from(row).map((char, i) => {
        // Character-specific randomization for organic feel
        const charRandomness = (Math.sin(i * 0.1) + 1) / 2; // Value between 0-1

        // Combine row progress with character randomness
        const charProgress = rowProgress * (1.0 + 0.2 * charRandomness);

        // Calculate reveal threshold with acceleration at the end
        const revealThreshold = charProgress < 0.8
          ? charProgress
          : charProgress + ((charProgress - 0.8) * 4); // Accelerate final reveal

        const shouldReveal = Math.random() < revealThreshold || charProgress >= 0.99;

        if (shouldReveal) {
          return char;
        } else {
          // Pick a random scrambled character
          const scrambleIndex = Math.floor(
            Math.random() * scrambleChars.length * (1 - charProgress)
          );
          return scrambleChars[scrambleIndex % scrambleChars.length];
        }
      }).join('');

      setDisplayText(newText);
    };

    // If animation is complete and progress is 1, just set the final text
    if (!isAnimating && progressValue.get() >= 0.99) {
      setDisplayText(row);
      return;
    }

    // Set up a listener for the motion value
    const unsubscribe = rowProgressValue.on("change", () => {
      updateText();
    });

    // Initial update
    updateText();

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [row, isAnimating, rowProgressValue, scrambleChars, progressValue]);

  return <div>{displayText}</div>;
};

export const DynamicFlickeringAsciiImage = dynamic(
  () =>
    import("./ascii-image").then((mod) => mod.FlickeringAsciiImage),
  {
    ssr: false, // Disable server-side rendering
    loading: () => null, // Optional loading component
  }
);

export const DynamicAsciiImage = dynamic(
  () => import("./ascii-image").then((mod) => mod.AsciiImage),
  {
    ssr: false,
    loading: () => null,
  }
);

export const DynamicScrambledAsciiImage = dynamic(
  () => import("./ascii-image").then((mod) => mod.ScrambledAsciiImage),
  {
    ssr: false,
    loading: () => null,
  }
);