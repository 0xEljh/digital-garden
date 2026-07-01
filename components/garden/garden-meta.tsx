import { HStack, Text } from "@chakra-ui/react";
import type { Stage, Confidence } from "@/lib/content/schema";
import { fmtDate } from "@/lib/content/format";
import { StageBadge } from "./stage-badge";

interface GardenMetaProps {
  date: string;
  tended: string;
  readTime: number;
  stage: Stage;
  confidence?: Confidence;
  /**
   * Compact (cards): stage + tended + read time — recency is the relevant
   * signal in a list. Full (post page): planted + tended + read time.
   */
  compact?: boolean;
}

export function GardenMeta({
  date,
  tended,
  readTime,
  stage,
  confidence,
  compact = false,
}: GardenMetaProps) {
  const tendedDiffers = fmtDate(date) !== fmtDate(tended);
  const segments = compact
    ? [`tended ${fmtDate(tended)}`, `${readTime} min read`]
    : ([
        `planted ${fmtDate(date)}`,
        tendedDiffers ? `tended ${fmtDate(tended)}` : null,
        `${readTime} min read`,
        confidence ? `confidence: ${confidence}` : null,
      ].filter(Boolean) as string[]);

  return (
    <HStack gap={2} wrap="wrap" color="gray.600">
      <StageBadge stage={stage} />
      <Text as="span" fontFamily="mono" fontSize="sm">
        {segments.join(" · ")}
      </Text>
    </HStack>
  );
}
