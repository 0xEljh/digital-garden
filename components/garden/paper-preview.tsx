import React, { useCallback, useEffect, useRef, useState } from "react";
import { Flex, Stack, Text } from "@chakra-ui/react";
import { Link } from "@/components/ui/link";
import { Tooltip } from "@/components/ui/tooltip";
import type { PaperPreviewData } from "@/pages/api/preview/paper";

const clientCache = new Map<string, PaperPreviewData>();

interface PaperPreviewProps {
  arxivId: string;
  title?: string;
  authors?: string;
  year?: number;
  children?: React.ReactNode;
}

export function PaperPreview({
  arxivId,
  title: titleOverride,
  authors: authorsOverride,
  year: yearOverride,
  children,
}: PaperPreviewProps) {
  const [data, setData] = useState<PaperPreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  const fetchPreview = useCallback(async () => {
    if (fetchedRef.current || clientCache.has(arxivId)) {
      if (clientCache.has(arxivId)) setData(clientCache.get(arxivId)!);
      return;
    }
    fetchedRef.current = true;
    setLoading(true);
    try {
      const res = await fetch(`/api/preview/paper?arxivId=${encodeURIComponent(arxivId)}`);
      if (res.ok) {
        const json: PaperPreviewData = await res.json();
        clientCache.set(arxivId, json);
        setData(json);
      }
    } catch {
      // silently fail — tooltip just won't show fetched data
    } finally {
      setLoading(false);
    }
  }, [arxivId]);

  useEffect(() => {
    // Prefetch on mount so tooltip data is ready
    fetchPreview();
  }, [fetchPreview]);

  const displayTitle = titleOverride || data?.title || arxivId;
  const displayAuthors = authorsOverride || data?.authors || "";
  const displayYear = yearOverride || data?.year;
  const abstractSnippet = data?.abstract
    ? data.abstract.length > 200
      ? data.abstract.slice(0, 200) + "…"
      : data.abstract
    : null;

  const href = `https://arxiv.org/abs/${arxivId}`;

  const tooltipContent = (
    <Stack gap={1} maxW="320px" p={1}>
      <Text fontWeight="bold" fontSize="sm" color="gray.100" lineHeight="short">
        {displayTitle}
      </Text>
      {displayAuthors && (
        <Text fontSize="xs" color="gray.400">
          {displayAuthors}
          {displayYear ? ` (${displayYear})` : ""}
        </Text>
      )}
      {loading && (
        <Text fontSize="xs" color="gray.500" fontStyle="italic">
          Loading…
        </Text>
      )}
      {abstractSnippet && (
        <Text fontSize="xs" color="gray.300" lineHeight="tall">
          {abstractSnippet}
        </Text>
      )}
      <Flex align="center" gap={1}>
        <Text fontSize="xs" color="cyan.400">
          arXiv:{arxivId}
        </Text>
      </Flex>
    </Stack>
  );

  const label = children || displayTitle;

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
      <Link
        href={href}
        color="cyan.400"
        _hover={{ color: "cyan.300", textDecoration: "underline" }}
        fontWeight="medium"
      >
        {label}
      </Link>
    </Tooltip>
  );
}
