import { Box, Text } from "@chakra-ui/react";
import type { Stage } from "@/lib/content/schema";

const STAGE_LABEL: Record<Stage, string> = {
  seedling: "seedling",
  budding: "budding",
  evergreen: "evergreen",
};

/** Minimal monospace maturity chip, e.g. [seedling], colored via stage.* tokens. */
export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <Text
      as="span"
      fontFamily="mono"
      fontSize="xs"
      color={`stage.${stage}`}
      whiteSpace="nowrap"
    >
      [{STAGE_LABEL[stage]}]
    </Text>
  );
}

const STAGE_NOTE: Partial<Record<Stage, string>> = {
  seedling:
    "Rough early draft — but planted anyway. Gaps, missing content, and loose ends expected.",
  budding:
    "Taking shape — the structure's been laid down but the details need ironing out.",
};

/** The reader/author permission contract. Evergreen posts render nothing. */
export function StageNote({ stage }: { stage: Stage }) {
  const note = STAGE_NOTE[stage];
  if (!note) return null;
  return (
    <Box
      borderLeftWidth="2px"
      borderColor={`stage.${stage}`}
      pl={4}
      py={2}
      color="gray.400"
      fontFamily="mono"
      fontSize="sm"
      lineHeight={1.6}
    >
      {note}
    </Box>
  );
}
