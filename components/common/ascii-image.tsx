import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Box } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { convertImageToAscii } from "../../lib/utils/asciiConverter";
import { useAmbientMotion } from "@/components/animations/use-ambient-motion";

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
  ambientEnabled?: boolean;
}

export const FlickeringAsciiImage = ({
  imagePath,
  width = 100,
  sampleFactor = 4,
  fontSize = "8px",
  precomputedAscii,
  skipConversion = false,
  onReady,
  ambientEnabled = true,
}: FlickeringAsciiImageProps) => {
  const [asciiArt, setAsciiArt] = useState<string>(precomputedAscii || "");
  const rows = asciiArt.split("\n");
  const readyNotifiedRef = useRef(false);
  const { ref: ambientRef, active: ambientActive } =
    useAmbientMotion<HTMLPreElement>({
      enabled: ambientEnabled && Boolean(asciiArt),
    });

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
      aria-hidden="true"
      ref={ambientRef}
      data-motion-id="ascii.ambient"
      data-motion-state={ambientActive ? "active" : "static"}
      fontFamily="mono"
      whiteSpace="pre"
      p={4}
      overflow="auto"
      color="fg.muted"
      fontSize={fontSize}
    >
      <style>{`
        @keyframes ascii-row-opacity {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }
        @keyframes ascii-row-shift {
          0% { transform: translateX(var(--ascii-shift-left)); }
          33.333% { transform: translateX(0); }
          66.667% { transform: translateX(var(--ascii-shift-right)); }
          100% { transform: translateX(0); }
        }
        @keyframes ascii-source-flicker {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0; }
        }
        @keyframes ascii-hash-flicker {
          0% {
            opacity: 0;
            transform: translateX(var(--ascii-hash-shift-left));
          }
          50% { opacity: 1; transform: translateX(0); }
          100% {
            opacity: 0;
            transform: translateX(var(--ascii-hash-shift-right));
          }
        }
        [data-motion-id="ascii.ambient"] .ascii-source-row { opacity: 1; }
        [data-motion-id="ascii.ambient"] .ascii-hash-row { opacity: 0; }
        [data-motion-id="ascii.ambient"][data-motion-state="active"] .ascii-opacity-row {
          animation:
            ascii-row-opacity var(--ascii-duration) cubic-bezier(0.5, 0, 0.75, 0) var(--ascii-delay) infinite alternate,
            ascii-row-shift var(--ascii-duration) cubic-bezier(0.5, 0, 0.75, 0) var(--ascii-delay) infinite alternate;
        }
        [data-motion-id="ascii.ambient"][data-motion-state="active"] .ascii-source-row {
          animation: ascii-source-flicker 150ms steps(2) var(--ascii-delay) infinite;
        }
        [data-motion-id="ascii.ambient"][data-motion-state="active"] .ascii-hash-row {
          animation: ascii-hash-flicker 100ms linear var(--ascii-hash-delay) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          [data-motion-id="ascii.ambient"] .ascii-opacity-row,
          [data-motion-id="ascii.ambient"] .ascii-source-row,
          [data-motion-id="ascii.ambient"] .ascii-hash-row {
            animation: none !important;
          }
        }
      `}</style>
      {rows.map((row, index) => (
        <FlickerRow key={`${index}:${row}`} row={row} />
      ))}
    </Box>
  );
};

const FlickerRow = ({ row }: { row: string }) => {
  if (!row) return <div />;

  const seed = hashString(row);
  const hashFlicker = randomFromSeed(seed) >= 0.98;
  const delay = randomFromSeed(seed + 1) * 0.8 + 5;
  const intensity = randomFromSeed(seed + 2) * 2 + 1;
  const style = {
    "--ascii-delay": `${delay}s`,
    "--ascii-hash-delay": `${delay + 0.05}s`,
    "--ascii-duration": `${0.12 * intensity}s`,
    "--ascii-shift-left": `${intensity * -0.5}px`,
    "--ascii-shift-right": `${intensity * 0.5}px`,
    "--ascii-hash-shift-left": `${intensity * -1}px`,
    "--ascii-hash-shift-right": `${intensity}px`,
  } as CSSProperties;

  if (!hashFlicker) {
    return <div className="ascii-opacity-row" style={style}>{row}</div>;
  }

  return (
    <div style={{ ...style, position: "relative", display: "block" }}>
      <span className="ascii-source-row" style={{ position: "absolute", inset: 0 }}>
        {row}
      </span>
      <span className="ascii-hash-row" style={{ position: "absolute", inset: 0 }}>
        {"/".repeat(row.length)}
      </span>
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
