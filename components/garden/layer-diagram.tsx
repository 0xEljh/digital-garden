import React from "react";
import { Box, Flex, Stack, Text } from "@chakra-ui/react";

const LAYER_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  purple: { bg: "purple.900", border: "purple.500", text: "purple.200" },
  blue: { bg: "blue.900", border: "blue.500", text: "blue.200" },
  cyan: { bg: "cyan.900", border: "cyan.500", text: "cyan.200" },
  green: { bg: "green.900", border: "green.500", text: "green.200" },
  orange: { bg: "orange.900", border: "orange.500", text: "orange.200" },
  red: { bg: "red.900", border: "red.500", text: "red.200" },
  gray: { bg: "gray.800", border: "gray.600", text: "gray.300" },
  yellow: { bg: "yellow.900", border: "yellow.500", text: "yellow.200" },
};

const DEFAULT_COLOR = LAYER_COLORS.blue;

interface LayerDiagramProps {
  children: React.ReactNode;
  caption?: string;
  direction?: "vertical" | "horizontal";
}

export function LayerDiagram({
  children,
  caption,
  direction = "vertical",
}: LayerDiagramProps) {
  const isVertical = direction === "vertical";

  return (
    <Stack gap={2} my={6} align="center">
      <Flex
        direction={isVertical ? "column" : "row"}
        align="stretch"
        gap={0}
        p={4}
        rounded="lg"
        border="1px solid"
        borderColor="gray.700"
        bg="gray.900"
        minW={isVertical ? "280px" : undefined}
        w={isVertical ? "fit-content" : undefined}
        mx="auto"
      >
        {React.Children.map(children, (child, index) => {
          const total = React.Children.count(children);
          return (
            <>
              {child}
              {index < total - 1 && (
                <ConnectionArrow direction={direction} />
              )}
            </>
          );
        })}
      </Flex>
      {caption && (
        <Text
          fontSize="sm"
          fontFamily="monospace"
          color="gray.500"
          textAlign="center"
          fontStyle="italic"
        >
          {caption}
        </Text>
      )}
    </Stack>
  );
}

interface LayerProps {
  label: string;
  color?: string;
  variant?: "default" | "thin";
  params?: string;
}

export function Layer({
  label,
  color = "blue",
  variant = "default",
  params,
}: LayerProps) {
  const colors = LAYER_COLORS[color] || DEFAULT_COLOR;
  const isThin = variant === "thin";

  return (
    <Flex
      align="center"
      justify="center"
      py={isThin ? 1.5 : 3}
      px={4}
      bg={colors.bg}
      borderWidth="1px"
      borderColor={colors.border}
      rounded="md"
      minW="200px"
      position="relative"
    >
      <Text
        fontSize={isThin ? "xs" : "sm"}
        fontWeight={isThin ? "normal" : "semibold"}
        color={colors.text}
        fontFamily="Aeion Mono"
        textAlign="center"
      >
        {label}
      </Text>
      {params && (
        <Text
          fontSize="2xs"
          color="gray.500"
          position="absolute"
          right={2}
          top="50%"
          transform="translateY(-50%)"
          fontFamily="monospace"
        >
          {params}
        </Text>
      )}
    </Flex>
  );
}

interface LayerRowProps {
  children: React.ReactNode;
  gap?: number;
}

export function LayerRow({ children, gap = 2 }: LayerRowProps) {
  return (
    <Flex direction="row" gap={gap} align="stretch" justify="center">
      {children}
    </Flex>
  );
}

function ConnectionArrow({ direction = "vertical" }: { direction?: "vertical" | "horizontal" }) {
  const isVertical = direction === "vertical";

  return (
    <Flex
      align="center"
      justify="center"
      py={isVertical ? 0 : 0}
      px={isVertical ? 0 : 0}
      h={isVertical ? "20px" : undefined}
      w={isVertical ? undefined : "20px"}
    >
      <Box
        w={isVertical ? "1px" : "100%"}
        h={isVertical ? "100%" : "1px"}
        bg="gray.600"
      />
    </Flex>
  );
}
