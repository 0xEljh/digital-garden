import { HStack, Text } from "@chakra-ui/react";
import type { Stage, Confidence } from "@/lib/content/schema";
import { fmtDate } from "@/lib/content/format";
import { StageBadge } from "./stage-badge";

interface EntryMetaProps {
  date: string;
  tended: string;
  readTime: number;
  stage: Stage;
  confidence?: Confidence;
  /**
   * Compact (cards): state + updated + read time — recency is the relevant
   * signal in a list. Full (post page): logged + updated + read time.
   */
  compact?: boolean;
}

export function EntryMeta({
  date,
  tended,
  readTime,
  stage,
  confidence,
  compact = false,
}: EntryMetaProps) {
  const updatedDiffers = fmtDate(date) !== fmtDate(tended);
  const segments = compact
    ? [`updated ${fmtDate(tended)}`, `${readTime} min read`]
    : ([
        `logged ${fmtDate(date)}`,
        updatedDiffers ? `updated ${fmtDate(tended)}` : null,
        `${readTime} min read`,
        confidence ? `confidence: ${confidence}` : null,
      ].filter(Boolean) as string[]);

  return (
    <HStack gap={2} wrap="wrap" color="text.meta">
      <StageBadge stage={stage} />
      <Text as="span" fontFamily="mono" fontSize="sm">
        {segments.join(" · ")}
      </Text>
    </HStack>
  );
}
