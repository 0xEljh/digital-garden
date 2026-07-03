import React, { useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";
import { FlickeringAsciiImage } from "./ascii-image";
import { ScrambleText } from "./scramble-text";

type FlickerProps = React.ComponentProps<typeof FlickeringAsciiImage>;

interface HydratedFlickeringAsciiImageProps extends FlickerProps {
  scrambleOnHydrate?: boolean;
  scrambleSpeedMs?: number;
  scrambleIterations?: number;
}

export const HydratedFlickeringAsciiImage = ({
  precomputedAscii,
  scrambleOnHydrate = true,
  scrambleSpeedMs = 16,
  scrambleIterations = 14,
  skipConversion,
  fontSize = "8px",
  onReady,
  ...props
}: HydratedFlickeringAsciiImageProps) => {
  const [hydrated, setHydrated] = useState(false);
  const [showScramble, setShowScramble] = useState(false);

  const effectiveSkipConversion =
    typeof skipConversion === "boolean" ? skipConversion : Boolean(precomputedAscii);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setHydrated(true);

      if (scrambleOnHydrate && precomputedAscii) {
        setShowScramble(true);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [scrambleOnHydrate, precomputedAscii]);

  return (
    <Box position="relative" width="fit-content">
      {!hydrated ? (
        <Box
          as="pre"
          fontFamily="mono"
          whiteSpace="pre"
          p={4}
          overflow="auto"
          color="fg.muted"
          fontSize={fontSize}
        >
          {precomputedAscii || ""}
        </Box>
      ) : (
        <Box opacity={showScramble ? 0 : 1} transition="opacity 0.25s ease-out">
          <FlickeringAsciiImage
            {...props}
            precomputedAscii={precomputedAscii}
            skipConversion={effectiveSkipConversion}
            fontSize={fontSize}
            onReady={onReady}
          />
        </Box>
      )}

      {hydrated && showScramble && precomputedAscii && (
        <Box position="absolute" inset={0} pointerEvents="none">
          <Box
            as="pre"
            fontFamily="mono"
            whiteSpace="pre"
            p={4}
            overflow="hidden"
            color="fg.muted"
            fontSize={fontSize}
          >
            <ScrambleText
              text={precomputedAscii}
              startScrambled
              speedMs={scrambleSpeedMs}
              maxIterations={scrambleIterations}
              animateOn="mount"
              onComplete={() => setShowScramble(false)}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};
