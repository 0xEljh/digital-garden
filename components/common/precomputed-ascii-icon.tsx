"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Box, BoxProps } from "@chakra-ui/react";
import { animate, cubicBezier, MotionValue, useMotionValue, useTransform } from "motion/react";
import dynamic from "next/dynamic";
import asciiAssets from "@/lib/generated/ascii-assets.json";

interface PrecomputedAsciiIconProps extends BoxProps {
  iconName: string;
  fontSize?: string;
  scrambleAnimationDuration?: number;
  highlighted?: boolean | "group-hover";
  highlightColor?: string;
  sweep?: "up" | "down" | false;
  noAnimation?: boolean;
  asciiWidth?: number;
}

type HighlightSegment = [rowIndex: number, startCol: number, endCol: number];

type PrecomputedPortfolioIconAsset = {
  ascii: string;
  width: number;
  effectiveWidth: number;
  fontSizeRatio?: number;
  highlight?: {
    color: string;
    coverage: number;
    segments: HighlightSegment[];
  };
};

// Default font size ratio (2px at width=240)
const DEFAULT_FONT_SIZE_RATIO = 0.0083;

// Characters to use for scrambling
const SCRAMBLE_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

// Smooth easing curve
const SMOOTH_EASING = cubicBezier(0.32, 0.12, 0.68, 0.93);

// Ignited state: colored glyphs bloom slightly, neon-style. The tight shadow
// reinforces the glyph body; the wide one reads as glow at 2-10px font sizes.
const ASCII_ACTIVE_STYLES = {
  color: "var(--ascii-highlight)",
  textShadow:
    "0 0 2px var(--ascii-highlight), 0 0 9px var(--ascii-highlight)",
  transitionDelay: "var(--ascii-hi-delay, 0ms)",
};

// Milliseconds between successive highlighted rows during the ignition sweep.
const SWEEP_STEP_MS = 14;

/**
 * Renders precomputed ASCII art for portfolio icons with scramble animation.
 */
export const PrecomputedAsciiIcon = ({
  iconName,
  fontSize,
  scrambleAnimationDuration = 4,
  highlighted = false,
  highlightColor,
  sweep = "up",
  noAnimation = false,
  asciiWidth,
  ...boxProps
}: PrecomputedAsciiIconProps) => {
  const iconData = (asciiAssets as unknown as { portfolioIcons?: Record<string, PrecomputedPortfolioIconAsset> })
    .portfolioIcons?.[iconName];

  const progressValue = useMotionValue(0);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);
  const segmentsByRow = useMemo(() => {
    const segmentMap = new Map<number, HighlightSegment[]>();

    for (const segment of iconData?.highlight?.segments ?? []) {
      const [rowIndex] = segment;
      const rowSegments = segmentMap.get(rowIndex) ?? [];
      rowSegments.push(segment);
      segmentMap.set(rowIndex, rowSegments);
    }

    return segmentMap;
  }, [iconData?.highlight?.segments]);

  // Sweep ranks: stagger the ignition across rows that actually contain
  // highlight segments, so the sweep travels the highlighted region instead
  // of spending its delay budget on empty rows.
  const sweepRankByRow = useMemo(() => {
    const rowsWithSegments = [...segmentsByRow.keys()].sort((a, b) => a - b);
    return new Map(rowsWithSegments.map((row, rank) => [row, rank]));
  }, [segmentsByRow]);

  useEffect(() => {
    if (!iconData) return;
    if (noAnimation) {
      animationRef.current?.stop();
      return;
    }

    // Start animation
    progressValue.set(0);

    // @ts-expect-error Type '1' has no properties in common with type 'ObjectTarget<MotionValue<number>>'
    animationRef.current = animate(progressValue, 1, {
      duration: scrambleAnimationDuration,
      easing: SMOOTH_EASING,
      repeat: 0,
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [iconData, noAnimation, scrambleAnimationDuration, progressValue]);

  if (!iconData) {
    return null;
  }

  const rows = iconData.ascii.split("\n");
  const resolvedHighlightColor = resolveCssColor(highlightColor ?? iconData.highlight?.color);

  // Calculate font size based on width and ratio
  const fontSizeRatio = iconData.fontSizeRatio ?? DEFAULT_FONT_SIZE_RATIO;
  const calculatedFontSize = fontSize ?? `${Math.max(1, Math.round((asciiWidth ?? iconData.width) * fontSizeRatio))}px`;

  return (
    <Box
      as="pre"
      data-ascii-active={highlighted === true || undefined}
      fontFamily="mono"
      whiteSpace="pre"
      p={4}
      overflow="auto"
      color="fg.muted"
      fontSize={calculatedFontSize}
      css={{
        "--ascii-highlight": resolvedHighlightColor,
        "& .ascii-hi": {
          transition: "color 0.25s ease-in-out, text-shadow 0.25s ease-in-out",
        },
        "&[data-ascii-active] .ascii-hi": ASCII_ACTIVE_STYLES,
        ...(highlighted === "group-hover" ? {
          ".group:hover & .ascii-hi": ASCII_ACTIVE_STYLES,
        } : {}),
        "@media (prefers-reduced-motion: reduce)": {
          "& .ascii-hi": {
            transition: "none",
          },
        },
      }}
      {...boxProps}
    >
      {rows.map((row, rowIndex) => (
        <ScrambledRow
          key={`${iconName}-${rowIndex}`}
          row={row}
          progressValue={progressValue}
          rowIndex={rowIndex}
          totalRows={rows.length}
          highlightSegments={segmentsByRow.get(rowIndex)}
          sweep={sweep}
          sweepRank={sweepRankByRow.get(rowIndex) ?? 0}
          sweepCount={sweepRankByRow.size}
          noAnimation={noAnimation}
        />
      ))}
    </Box>
  );
};

// Dotted names ("red.400", "accent.muted") are Chakra tokens; anything else
// (hex, rgb(), named colors, CSS vars) passes through as-is.
const resolveCssColor = (color = "currentColor") => {
  if (/^[a-zA-Z][\w]*(\.[\w]+)+$/.test(color)) {
    return `var(--chakra-colors-${color.split(".").join("-")})`;
  }

  return color;
};

const renderSegmentedText = (displayText: string, segments: HighlightSegment[]) => {
  const rendered: ReactNode[] = [];
  let cursor = 0;

  for (const [, startCol, endCol] of segments) {
    if (startCol > cursor) {
      rendered.push(displayText.slice(cursor, startCol));
    }

    rendered.push(
      <span key={`${startCol}-${endCol}`} className="ascii-hi">
        {displayText.slice(startCol, endCol)}
      </span>
    );
    cursor = endCol;
  }

  if (cursor < displayText.length) {
    rendered.push(displayText.slice(cursor));
  }

  return rendered;
};

// The ScrambledRow component handles the text scrambling animation for each row
const ScrambledRow = ({
  row,
  progressValue,
  rowIndex,
  totalRows,
  highlightSegments,
  sweep,
  sweepRank,
  sweepCount,
  noAnimation,
}: {
  row: string;
  progressValue: MotionValue<number>;
  rowIndex: number;
  totalRows: number;
  highlightSegments?: HighlightSegment[];
  sweep: "up" | "down" | false;
  sweepRank: number;
  sweepCount: number;
  noAnimation: boolean;
}) => {
  const [displayText, setDisplayText] = useState(noAnimation ? row : "");

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
    return SMOOTH_EASING(rowProgress);
  });

  // Update display text whenever rowProgressValue changes
  useEffect(() => {
    if (noAnimation) return;

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
            Math.random() * SCRAMBLE_CHARS.length * (1 - charProgress)
          );
          return SCRAMBLE_CHARS[scrambleIndex % SCRAMBLE_CHARS.length];
        }
      }).join('');

      setDisplayText(newText);
    };

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
  }, [row, noAnimation, rowProgressValue]);

  const renderedText = noAnimation ? row : displayText;

  if (!highlightSegments || highlightSegments.length === 0) {
    return <div>{renderedText}</div>;
  }

  const delay = sweep === "up"
    ? (sweepCount - 1 - sweepRank) * SWEEP_STEP_MS
    : sweep === "down"
      ? sweepRank * SWEEP_STEP_MS
      : 0;
  const style = sweep === false
    ? undefined
    : ({ "--ascii-hi-delay": `${delay}ms` } as CSSProperties);

  return <div style={style}>{renderSegmentedText(renderedText, highlightSegments)}</div>;
};

// Dynamic import to avoid SSR issues with motion animations
export const DynamicPrecomputedAsciiIcon = dynamic(
  () => import("./precomputed-ascii-icon").then((mod) => mod.PrecomputedAsciiIcon),
  {
    ssr: false,
    loading: () => null,
  }
);

export default PrecomputedAsciiIcon;
