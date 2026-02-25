import { HStack, Stack, Text, Box } from "@chakra-ui/react";

const FILLED_CHAR = "█";
const PARTIAL_CHARS = [" ", "░", "▒", "▓", "█"];
const EMPTY_CHAR = "░";

interface AsciiBarProps {
  /** Value between 0 and 100 (percentage) */
  value: number;
  /** Total character width of the bar */
  width?: number;
  /** Color of the filled portion */
  color?: string;
  /** Color of the empty portion */
  emptyColor?: string;
}

/**
 * Renders a single ASCII progress bar using block characters.
 * Uses partial-fill characters (░▒▓█) for sub-character precision.
 */
export const AsciiBar = ({
  value,
  width = 16,
  color = "cyan.400",
  emptyColor = "gray.700",
}: AsciiBarProps) => {
  const clamped = Math.max(0, Math.min(100, value));
  const filledExact = (clamped / 100) * width;
  const filledFull = Math.floor(filledExact);
  const remainder = filledExact - filledFull;
  const partialIndex = Math.round(remainder * (PARTIAL_CHARS.length - 1));
  const emptyCount = width - filledFull - (partialIndex > 0 ? 1 : 0);

  const filledStr = FILLED_CHAR.repeat(filledFull);
  const partialStr = partialIndex > 0 ? PARTIAL_CHARS[partialIndex] : "";
  const emptyStr = EMPTY_CHAR.repeat(Math.max(0, emptyCount));

  return (
    <Text fontFamily="monospace" fontSize="xs" letterSpacing="0" lineHeight="1" whiteSpace="pre">
      <Text as="span" color={color}>{filledStr}{partialStr}</Text>
      <Text as="span" color={emptyColor}>{emptyStr}</Text>
    </Text>
  );
};

export interface AsciiBarListItem {
  name: string;
  value: number;
}

interface AsciiBarListProps {
  /** Items to display — value is a raw number (will be normalized to max) */
  data: AsciiBarListItem[];
  /** Total character width of each bar */
  barWidth?: number;
  /** Color of the filled bars */
  color?: string;
  /** Whether to show the value as a percentage suffix */
  showValue?: boolean;
  /** Value suffix label (e.g. "%" or "h") */
  valueSuffix?: string;
  /** Whether to sort by value descending (default: true) */
  sorted?: boolean;
}

/**
 * A list of labeled ASCII bars — a terminal-aesthetic replacement
 * for BarList. Sorts by value descending and normalizes to the max.
 */
export const AsciiBarList = ({
  data,
  barWidth = 12,
  color = "cyan.400",
  showValue = true,
  valueSuffix = "%",
  sorted = true,
}: AsciiBarListProps) => {
  const items = sorted
    ? [...data].sort((a, b) => b.value - a.value)
    : data;
  const maxValue = Math.max(...items.map((d) => d.value), 1);

  return (
    <Stack gap={1}>
      {items.map((item) => {
        const pct = (item.value / maxValue) * 100;
        return (
          <HStack key={item.name} gap={2} align="center">
            <Text
              fontSize="xs"
              fontFamily="Tickerbit"
              color="fg.muted"
              minW="80px"
              textAlign="right"
              truncate
            >
              {item.name}
            </Text>
            <AsciiBar value={pct} width={barWidth} color={color} />
            {showValue && (
              <Text
                fontSize="xs"
                fontFamily="Tickerbit"
                color="fg.muted"
                minW="40px"
                textAlign="right"
              >
                {item.value.toFixed(1)}{valueSuffix}
              </Text>
            )}
          </HStack>
        );
      })}
    </Stack>
  );
};

interface AsciiRatioBarProps {
  /** First segment value (0-100) */
  leftValue: number;
  /** Second segment value (0-100) */
  rightValue: number;
  /** Total character width */
  width?: number;
  /** Color of the left segment */
  leftColor?: string;
  /** Color of the right segment */
  rightColor?: string;
}

/**
 * A dual-segment ASCII bar for showing ratios (e.g. dev vs. design time).
 */
export const AsciiRatioBar = ({
  leftValue,
  rightValue,
  width = 24,
  leftColor = "cyan.400",
  rightColor = "purple.400",
}: AsciiRatioBarProps) => {
  const total = leftValue + rightValue;
  if (total === 0) {
    return (
      <Text fontFamily="monospace" fontSize="xs" letterSpacing="0" lineHeight="1" whiteSpace="pre" color="gray.700">
        {EMPTY_CHAR.repeat(width)}
      </Text>
    );
  }

  const leftChars = Math.round((leftValue / total) * width);
  const rightChars = width - leftChars;

  return (
    <Text fontFamily="monospace" fontSize="xs" letterSpacing="0" lineHeight="1" whiteSpace="pre">
      <Text as="span" color={leftColor}>{FILLED_CHAR.repeat(leftChars)}</Text>
      <Text as="span" color={rightColor}>{FILLED_CHAR.repeat(rightChars)}</Text>
    </Text>
  );
};
