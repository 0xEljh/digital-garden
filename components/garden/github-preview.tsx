import React, { useCallback, useEffect, useRef, useState } from "react";
import { Flex, Stack, Text } from "@chakra-ui/react";
import { Link } from "@/components/ui/link";
import { Tooltip } from "@/components/ui/tooltip";
import type { GithubPreviewData } from "@/pages/api/preview/github";

const clientCache = new Map<string, GithubPreviewData>();

interface GithubPreviewProps {
  repo: string;
  children?: React.ReactNode;
}

export function GithubPreview({ repo, children }: GithubPreviewProps) {
  const [data, setData] = useState<GithubPreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  const fetchPreview = useCallback(async () => {
    if (fetchedRef.current || clientCache.has(repo)) {
      if (clientCache.has(repo)) setData(clientCache.get(repo)!);
      return;
    }
    fetchedRef.current = true;
    setLoading(true);
    try {
      const res = await fetch(`/api/preview/github?repo=${encodeURIComponent(repo)}`);
      if (res.ok) {
        const json: GithubPreviewData = await res.json();
        clientCache.set(repo, json);
        setData(json);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [repo]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  const href = data?.url || `https://github.com/${repo}`;
  const stars = data?.stars;

  const formatStars = (n: number): string => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  const tooltipContent = (
    <Stack gap={1} maxW="280px" p={1}>
      <Flex align="center" gap={2}>
        <Text fontWeight="bold" fontSize="sm" color="gray.100">
          {repo}
        </Text>
      </Flex>
      {loading && (
        <Text fontSize="xs" color="gray.500" fontStyle="italic">
          Loading…
        </Text>
      )}
      {data?.description && (
        <Text fontSize="xs" color="gray.300" lineHeight="tall">
          {data.description}
        </Text>
      )}
      {stars !== undefined && stars !== null && (
        <Text fontSize="xs" color="gray.400">
          ★ {formatStars(stars)}
        </Text>
      )}
    </Stack>
  );

  const label = children || repo;

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
        color="gray.300"
        _hover={{ color: "white", textDecoration: "underline" }}
        fontFamily="monospace"
        fontSize="sm"
      >
        {label}
      </Link>
    </Tooltip>
  );
}
