import { HStack, Stack, Text } from "@chakra-ui/react";
import type { Stage } from "@/lib/content/schema";
import { glyphForStage } from "@/lib/content/schema";
import { fmtDate } from "@/lib/content/format";
import { StageBadge } from "./stage-badge";

/** The pre-rendered preview payload an internal log link shows on hover. */
export interface LinkPreview {
  slug: string;
  title: string;
  excerpt: string;
  url: string;
  stage?: Stage;
  tended?: string;
}

/**
 * gwern-lite hover preview: state glyph + title · excerpt · state/updated.
 * The card chrome (bg, border) lives on HoverCardContent; this is the body.
 */
export function LinkPreviewCard({ preview }: { preview: LinkPreview }) {
  return (
    <Stack gap={1.5}>
      <HStack gap={2} align="baseline">
        {preview.stage && (
          <Text
            as="span"
            color={`state.${preview.stage}`}
            fontFamily="mono"
            fontSize="sm"
            aria-hidden="true"
          >
            {glyphForStage(preview.stage)}
          </Text>
        )}
        <Text fontFamily="heading" fontSize="sm" color="text.body" lineClamp={2}>
          {preview.title}
        </Text>
      </HStack>

      {preview.excerpt && (
        <Text fontSize="xs" color="text.meta" lineHeight={1.5} lineClamp={3}>
          {preview.excerpt}
        </Text>
      )}

      <HStack gap={2} color="text.meta" fontFamily="mono" fontSize="xs">
        {preview.stage && <StageBadge stage={preview.stage} />}
        {preview.tended && <Text as="span">· updated {fmtDate(preview.tended)}</Text>}
      </HStack>
    </Stack>
  );
}
