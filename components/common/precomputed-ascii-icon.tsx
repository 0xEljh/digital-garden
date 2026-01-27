"use client";

import { useEffect, useRef, useState } from "react";
import { Box, BoxProps } from "@chakra-ui/react";
import { animate, cubicBezier, motionValue, MotionValue, useTransform } from "motion/react";
import dynamic from "next/dynamic";
import asciiAssets from "@/lib/generated/ascii-assets.json";

interface PrecomputedAsciiIconProps extends BoxProps {
  iconName: string;
  fontSize?: string;
  scrambleAnimationDuration?: number;
}

// Default font size ratio (2px at width=240)
const DEFAULT_FONT_SIZE_RATIO = 0.0083;
// Icons with custom font size ratios
const CUSTOM_FONT_SIZE_ICONS: Record<string, number> = {
  LightSabreIcon: 0.0166,
  UnderTheRockIcon: 0.0166,
};

// Characters to use for scrambling
const SCRAMBLE_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

// Smooth easing curve
const SMOOTH_EASING = cubicBezier(0.32, 0.12, 0.68, 0.93);

/**
 * Renders precomputed ASCII art for portfolio icons with scramble animation.
 */
export const PrecomputedAsciiIcon = ({
  iconName,
  fontSize,
  scrambleAnimationDuration = 4,
  ...boxProps
}: PrecomputedAsciiIconProps) => {
  const iconData = (asciiAssets as { portfolioIcons?: Record<string, { ascii: string; width: number }> })
    .portfolioIcons?.[iconName];

  const [isAnimating, setIsAnimating] = useState(true);
  const progressValue = useRef(motionValue(0)).current;
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    if (!iconData) return;

    // Start animation
    setIsAnimating(true);
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
  }, [iconData, scrambleAnimationDuration, progressValue]);

  if (!iconData) {
    return null;
  }

  const rows = iconData.ascii.split("\n");

  // Calculate font size based on width and ratio
  const fontSizeRatio = CUSTOM_FONT_SIZE_ICONS[iconName] ?? DEFAULT_FONT_SIZE_RATIO;
  const calculatedFontSize = fontSize ?? `${Math.max(1, Math.round(iconData.width * fontSizeRatio))}px`;

  return (
    <Box
      as="pre"
      fontFamily="Aeion Mono"
      whiteSpace="pre"
      p={4}
      overflow="auto"
      color="fg.muted"
      fontSize={calculatedFontSize}
      {...boxProps}
    >
      {rows.map((row, rowIndex) => (
        <ScrambledRow
          key={rowIndex}
          row={row}
          isAnimating={isAnimating}
          progressValue={progressValue}
          rowIndex={rowIndex}
          totalRows={rows.length}
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
  rowIndex,
  totalRows,
}: {
  row: string;
  isAnimating: boolean;
  progressValue: MotionValue<number>;
  rowIndex: number;
  totalRows: number;
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
    return SMOOTH_EASING(rowProgress);
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
            Math.random() * SCRAMBLE_CHARS.length * (1 - charProgress)
          );
          return SCRAMBLE_CHARS[scrambleIndex % SCRAMBLE_CHARS.length];
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
  }, [row, isAnimating, rowProgressValue, progressValue]);

  return <div>{displayText}</div>;
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
