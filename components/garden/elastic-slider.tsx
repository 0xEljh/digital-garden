import React, { useEffect, useRef, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import {
  animate,
  m,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";

const MAX_OVERFLOW = 50;

function decay(value: number, max: number): number {
  if (max === 0) return 0;
  const entry = value / max;
  const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);
  return sigmoid * max;
}

export interface ElasticSliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (v: number) => void;
  formatValue?: (v: number) => string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  width?: string | number;
}

export function ElasticSlider({
  value: controlledValue,
  defaultValue = 50,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  formatValue,
  leftIcon = <Text color="gray.400" fontSize="sm" fontWeight="bold" userSelect="none">−</Text>,
  rightIcon = <Text color="gray.400" fontSize="sm" fontWeight="bold" userSelect="none">+</Text>,
  label,
  width = "12rem",
}: ElasticSliderProps) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? controlledValue : internalValue;

  const sliderRef = useRef<HTMLDivElement>(null);
  const [region, setRegion] = useState<"left" | "middle" | "right">("middle");
  const clientX = useMotionValue(0);
  const overflow = useMotionValue(0);
  const scale = useMotionValue(1);

  useEffect(() => {
    if (!isControlled) setInternalValue(defaultValue);
  }, [defaultValue, isControlled]);

  const setValue = (v: number) => {
    if (!isControlled) setInternalValue(v);
    onValueChange?.(v);
  };

  useMotionValueEvent(clientX, "change", (latest) => {
    if (sliderRef.current) {
      const { left, right } = sliderRef.current.getBoundingClientRect();
      let newValue: number;

      if (latest < left) {
        setRegion("left");
        newValue = left - latest;
      } else if (latest > right) {
        setRegion("right");
        newValue = latest - right;
      } else {
        setRegion("middle");
        newValue = 0;
      }

      overflow.jump(decay(newValue, MAX_OVERFLOW));
    }
  });

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons > 0 && sliderRef.current) {
      const { left, width: trackWidth } = sliderRef.current.getBoundingClientRect();
      let newValue = min + ((e.clientX - left) / trackWidth) * (max - min);

      if (step > 0) {
        newValue = Math.round(newValue / step) * step;
      }

      newValue = Math.min(Math.max(newValue, min), max);
      setValue(newValue);
      clientX.jump(e.clientX);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    handlePointerMove(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = () => {
    animate(overflow, 0, { type: "spring", bounce: 0.5 });
  };

  const getRangePercentage = () => {
    const totalRange = max - min;
    if (totalRange === 0) return 0;
    return ((currentValue - min) / totalRange) * 100;
  };

  const displayValue = formatValue
    ? formatValue(currentValue)
    : String(Math.round(currentValue * 100) / 100);

  return (
    <Flex direction="column" align="center" gap={2} w={width}>
      {label && (
        <Text fontSize="xs" color="gray.500" fontFamily="Aeion Mono">
          {label}
        </Text>
      )}
      <m.div
        onHoverStart={() => animate(scale, 1.2)}
        onHoverEnd={() => animate(scale, 1)}
        onTouchStart={() => animate(scale, 1.2)}
        onTouchEnd={() => animate(scale, 1)}
        style={{
          scale,
          opacity: useTransform(scale, [1, 1.2], [0.7, 1]),
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        <m.div
          animate={{
            scale: region === "left" ? [1, 1.4, 1] : 1,
            transition: { duration: 0.25 },
          }}
          style={{
            x: useTransform(() =>
              region === "left" ? -overflow.get() / scale.get() : 0
            ),
            flexShrink: 0,
          }}
        >
          {leftIcon}
        </m.div>

        <div
          ref={sliderRef}
          style={{
            position: "relative",
            display: "flex",
            width: "100%",
            flexGrow: 1,
            cursor: "grab",
            touchAction: "none",
            userSelect: "none",
            alignItems: "center",
            padding: "1rem 0",
          }}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <m.div
            style={{
              scaleX: useTransform(() => {
                if (sliderRef.current) {
                  const { width: trackWidth } =
                    sliderRef.current.getBoundingClientRect();
                  return 1 + overflow.get() / trackWidth;
                }
                return 1;
              }),
              scaleY: useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.8]),
              transformOrigin: useTransform(() => {
                if (sliderRef.current) {
                  const { left, width: trackWidth } =
                    sliderRef.current.getBoundingClientRect();
                  return clientX.get() < left + trackWidth / 2
                    ? "right"
                    : "left";
                }
                return "center";
              }),
              height: useTransform(scale, [1, 1.2], [6, 12]),
              marginTop: useTransform(scale, [1, 1.2], [0, -3]),
              marginBottom: useTransform(scale, [1, 1.2], [0, -3]),
              display: "flex",
              flexGrow: 1,
            }}
          >
            <Box
              position="relative"
              h="full"
              flex={1}
              overflow="hidden"
              rounded="full"
              bg="gray.700"
            >
              <Box
                position="absolute"
                h="full"
                bg="gray.500"
                rounded="full"
                style={{ width: `${getRangePercentage()}%` }}
              />
            </Box>
          </m.div>
        </div>

        <m.div
          animate={{
            scale: region === "right" ? [1, 1.4, 1] : 1,
            transition: { duration: 0.25 },
          }}
          style={{
            x: useTransform(() =>
              region === "right" ? overflow.get() / scale.get() : 0
            ),
            flexShrink: 0,
          }}
        >
          {rightIcon}
        </m.div>
      </m.div>

      <Text fontSize="xs" color="gray.400" fontFamily="Aeion Mono">
        {displayValue}
      </Text>

      {/* Hidden range input for keyboard/a11y */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-label={label || "Slider"}
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          borderWidth: 0,
        }}
      />
    </Flex>
  );
}
