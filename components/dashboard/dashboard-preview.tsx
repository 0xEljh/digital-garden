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

  const topTools =
    analytics?.devToolsBreakdown.slice(0, 4).map((item) => ({
      name: item.name,
      value: item.percentage,
    })) ?? [];

  return (
    <Stack gap={4} w="full">
      <Heading size="md" fontFamily="display" fontWeight="100" textAlign="left">
        operator status
      </Heading>

      <Stack
        gap={3}
        p={4}
        borderWidth="1px"
        borderColor="edge.muted"
        borderRadius="lg"
        bg="surface.panel"
      >
        <Stack gap={1} fontFamily="mono" fontSize="xs" color="fg.muted">
          <HStack gap={3} align="baseline">
            <Text color="text.meta" minW="5.5rem">operator</Text>
            <Text>0xEljh</Text>
          </HStack>
          <HStack gap={3} align="baseline">
            <Text color="text.meta" minW="5.5rem">class</Text>
            <Text>systems engineer · ai researcher</Text>
          </HStack>
          <HStack gap={3} align="baseline">
            <Text color="text.meta" minW="5.5rem">assignment</Text>
            <Text>ai for science · startup research co.</Text>
          </HStack>
          <HStack gap={3} align="baseline">
            <Text color="text.meta" minW="5.5rem">status</Text>
            <Text>online — behind the glass</Text>
          </HStack>
        </Stack>

        {topTools.length > 0 && (
          <Stack gap={2}>
            <Text fontSize="xs" fontFamily="mono" color="text.meta">
              tools · {analytics?.daysIncluded ?? 0}d window
            </Text>
            <AsciiBarList
              data={topTools}
              barWidth={10}
              color="data.dev"
              showValue={true}
              valueSuffix="%"
            />
          </Stack>
        )}

        <HStack justify="space-between" pt={1}>
          <Text fontSize="xs" fontFamily="mono" color="fg.muted">
            {analytics ? `${formatHours(analytics.totalActiveTime.hours)} active` : "awaiting telemetry"}
          </Text>
          <Link href="/dashboard">
            <Text
              fontSize="xs"
              fontFamily="mono"
              color="accent.muted"
              _hover={{ color: "accent" }}
              transition="color 0.2s"
            >
              → stats
            </Text>
          </Link>
        </HStack>
      </Stack>
    </Stack>
  );
};
