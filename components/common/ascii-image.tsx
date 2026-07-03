import { useEffect, useRef, useState } from "react";
import { Box } from "@chakra-ui/react";
import { m, cubicBezier, steps } from "motion/react";
import dynamic from "next/dynamic";
import { convertImageToAscii } from "../../lib/utils/asciiConverter";

interface FlickeringAsciiImageProps {
  imagePath: string;
  // Desired width (number of characters). The height is derived from image aspect ratio.
  width?: number;
  sampleFactor?: number;
  fontSize?: string;
  // If provided, this ASCII is used immediately as a placeholder.
  precomputedAscii?: string;
  // When true, skip image loading/conversion entirely.
  skipConversion?: boolean;
  // Called once when ASCII is ready to render.
  onReady?: () => void;
}

export const FlickeringAsciiImage = ({
  imagePath,
  width = 100,
  sampleFactor = 4,
  fontSize = "8px",
  precomputedAscii,
  skipConversion = false,
  onReady,
}: FlickeringAsciiImageProps) => {
  const [asciiArt, setAsciiArt] = useState<string>(precomputedAscii || "");
  const rows = asciiArt.split("\n");
  const readyNotifiedRef = useRef(false);

  useEffect(() => {
    if (!asciiArt) return;
    if (readyNotifiedRef.current) return;

    readyNotifiedRef.current = true;
    onReady?.();
  }, [asciiArt, onReady]);

  useEffect(() => {
    if (skipConversion) return;

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
  }, [imagePath, width, sampleFactor, skipConversion]);

  return (
    <Box
      as="pre"
      fontFamily="mono"
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

const FlickerRow = ({ row }: { row: string }) => {
  const seed = hashString(row);
  const flickerType = randomFromSeed(seed) < 0.98 ? "opacity" : "hash";
  const delay = randomFromSeed(seed + 1) * 0.8 + 5;
  const intensity = randomFromSeed(seed + 2) * 2 + 1;
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
          delay,
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
          delay,
        }}
      >
        {row}
      </m.span>
      <m.span
        style={{ position: "absolute", top: 0, left: 0 }}
        animate={{
          opacity: [0, 1, 0],
          x: [`${intensity * -1}px`, 0, `${intensity}px`],
        }}
        transition={{
          duration: 0.1,
          repeat: Infinity,
          ease: "linear",
          delay: delay + 0.05,
        }}
      >
        {hashRow}
      </m.span>
      <span style={{ visibility: "hidden" }}>{row}</span>
    </div>
  );
};

const hashString = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index++) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash);
};

const randomFromSeed = (seed: number) => {
  const next = (seed * 9301 + 49297) % 233280;
  return next / 233280;
};

export const DynamicFlickeringAsciiImage = dynamic(
  () => import("./ascii-image").then((mod) => mod.FlickeringAsciiImage),
  {
    ssr: false,
    loading: () => null,
  }
);
