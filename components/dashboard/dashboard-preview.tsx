import { Box, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { Link } from "@/components/ui/link";
import { useMemo } from "react";
import { AsciiBarList } from "@/components/ui/ascii-bar";
import { getAnalyticsForWindow, type AggregatedAnalytics } from "@/lib/utils/analytics";
import type { AnalyticsData } from "@/types/analytics";

const formatHours = (hours: number): string => {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }
  return `${hours.toFixed(1)}h`;
};

interface DashboardPreviewProps {
  analyticsData: AnalyticsData | null;
}

export const DashboardPreview = ({ analyticsData }: DashboardPreviewProps) => {
  const analytics = useMemo(() => {
    if (!analyticsData) return null;
    return getAnalyticsForWindow(analyticsData, "7d");
  }, [analyticsData]);

  if (!analytics || analytics.daysIncluded === 0) {
    return null; // Gracefully hide when no data
  }

  const topTools = analytics.devToolsBreakdown.slice(0, 4).map((item) => ({
    name: item.name,
    value: item.percentage,
  }));

  if (topTools.length === 0) return null;

  return (
    <Stack gap={4} w="full">
      <Heading size="md" fontFamily="Topoline" fontWeight="100" textAlign="left">
        System Status
      </Heading>

      <Stack
        gap={3}
        p={4}
        borderWidth="1px"
        borderColor="gray.800"
        borderRadius="lg"
        bg="gray.800/20"
      >
        <Text
          fontSize="xs"
          fontFamily="Aeion Mono"
          color="fg.muted"
        >
          dev tools · {analytics.daysIncluded}d window
        </Text>

        <AsciiBarList
          data={topTools}
          barWidth={10}
          color="cyan.400"
          showValue={true}
          valueSuffix="%"
        />

        <HStack justify="space-between" pt={1}>
          <Text fontSize="xs" fontFamily="Aeion Mono" color="fg.muted">
            {formatHours(analytics.totalActiveTime.hours)} active
          </Text>
          <Link href="/dashboard">
            <Text
              fontSize="xs"
              fontFamily="Aeion Mono"
              color="cyan.600"
              _hover={{ color: "cyan.400" }}
              transition="color 0.2s"
            >
              → Time Accounting
            </Text>
          </Link>
        </HStack>
      </Stack>
    </Stack>
  );
};
