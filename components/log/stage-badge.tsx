import { Box, Text } from "@chakra-ui/react";
import type { Stage } from "@/lib/content/schema";

const STAGE_LABEL: Record<Stage, string> = {
  sighted: "sighted",
  charted: "charted",
  mapped: "mapped",
};

/** Minimal monospace discovery chip, e.g. [sighted], colored via state.* tokens. */
export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <Text
      as="span"
      fontFamily="mono"
      fontSize="xs"
      color={`state.${stage}`}
      whiteSpace="nowrap"
    >
      [{STAGE_LABEL[stage]}]
    </Text>
  );
}

const STAGE_NOTE: Partial<Record<Stage, string>> = {
  sighted:
    "Initial sighting — a detection worth logging. Gaps, missing content, and loose ends expected.",
  charted:
    "Charted outline — the structure is visible; details are still being resolved.",
};

/** The reader/author permission contract. Mapped posts render nothing. */
export function StageNote({ stage }: { stage: Stage }) {
  const note = STAGE_NOTE[stage];
  if (!note) return null;
  return (
    <Box
      borderLeftWidth="2px"
      borderColor={`state.${stage}`}
      pl={4}
      py={2}
      color="text.meta"
      fontFamily="mono"
      fontSize="sm"
      lineHeight={1.6}
    >
      {note}
    </Box>
  );
}
