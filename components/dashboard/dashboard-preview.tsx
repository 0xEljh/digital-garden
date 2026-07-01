import { Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { Link } from "@/components/ui/link";
import { useMemo } from "react";
import { AsciiBarList } from "@/components/ui/ascii-bar";
import { getAnalyticsForWindow } from "@/lib/utils/analytics";
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
      <Heading size="md" fontFamily="display" fontWeight="100" textAlign="left">
        System Status
      </Heading>

      <Stack
        gap={3}
        p={4}
        borderWidth="1px"
        borderColor="edge.muted"
        borderRadius="lg"
        bg="surface.panel"
      >
        <Text
          fontSize="xs"
          fontFamily="mono"
          color="fg.muted"
        >
          dev tools · {analytics.daysIncluded}d window
        </Text>

        <AsciiBarList
          data={topTools}
          barWidth={10}
          color="data.dev"
          showValue={true}
          valueSuffix="%"
        />

        <HStack justify="space-between" pt={1}>
          <Text fontSize="xs" fontFamily="mono" color="fg.muted">
            {formatHours(analytics.totalActiveTime.hours)} active
          </Text>
          <Link href="/dashboard">
            <Text
              fontSize="xs"
              fontFamily="mono"
              color="accent.muted"
              _hover={{ color: "accent" }}
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
