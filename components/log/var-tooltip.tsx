import React from "react";
import { Box, Stack, Text, type BoxProps } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { InlineLatex } from "./latex";

type TooltipSegment =
  | { type: "text"; value: string }
  | { type: "math"; value: string; display: boolean };

function findNextUnescapedDollar(input: string, fromIndex: number): number {
  for (let i = fromIndex; i < input.length; i++) {
    if (input[i] === "$") {
      if (i > 0 && input[i - 1] === "\\") continue;
      return i;
    }
  }
  return -1;
}

function parseTooltipSegments(input: string): TooltipSegment[] {
  const segments: TooltipSegment[] = [];
  let i = 0;

  while (i < input.length) {
    const dollar = findNextUnescapedDollar(input, i);
    if (dollar === -1) {
      const rest = input.slice(i);
      if (rest) segments.push({ type: "text", value: rest });
      break;
    }

    const before = input.slice(i, dollar);
    if (before) segments.push({ type: "text", value: before });

    const isDouble = input[dollar + 1] === "$";
    const delimiter = isDouble ? "$$" : "$";
    const start = dollar + delimiter.length;

    const end = input.indexOf(delimiter, start);
    if (end === -1) {
      const rest = input.slice(dollar);
      if (rest) segments.push({ type: "text", value: rest });
      break;
    }

    const math = input.slice(start, end);
    segments.push({ type: "math", value: math, display: isDouble });
    i = end + delimiter.length;
  }

  return segments;
}

function renderTooltipText(input: string): React.ReactNode {
  const segments = parseTooltipSegments(input);

  return segments.map((seg, idx) => {
    if (seg.type === "math") {
      if (seg.display) {
        return (
          <Box key={idx} fontSize="sm">
            <InlineLatex math={seg.value} display />
          </Box>
        );
      }

      return <InlineLatex key={idx} math={seg.value} />;
    }

    return <React.Fragment key={idx}>{seg.value}</React.Fragment>;
  });
}

export interface VarTooltipProps extends BoxProps {
  tooltip: string;
  children: React.ReactNode;
}

export function VarTooltip({ tooltip, children, ...spanProps }: VarTooltipProps) {
  const tooltipContent = (
    <Stack gap={1} maxW="320px" p={1}>
      <Text fontSize="xs" color="gray.300" lineHeight="tall">
        {renderTooltipText(tooltip)}
      </Text>
    </Stack>
  );

  const className = Array.isArray(spanProps.className)
    ? spanProps.className.join(" ")
    : spanProps.className;

  return (
    <Tooltip
      content={tooltipContent}
      openDelay={200}
      closeDelay={100}
      showArrow
      contentProps={{
        bg: "gray.800",
        borderColor: "gray.700",
        borderWidth: "1px",
        rounded: "md",
        shadow: "lg",
        p: 2,
      }}
    >
      <Box
        as="span"
        cursor="help"
        textDecoration="underline"
        textDecorationStyle="dotted"
        textDecorationColor="gray.600"
        textUnderlineOffset="2px"
        {...spanProps}
        className={className}
      >
        {children}
      </Box>
    </Tooltip>
  );
}
