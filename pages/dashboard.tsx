import { GetStaticProps } from "next";
import {
    Box,
    Container,
    Heading,
    Stack,
    Text,
    SimpleGrid,
    Card,
    HStack,
    Flex,
} from "@chakra-ui/react";
import { useState, useMemo, useEffect } from "react";
import { AsciiBarList } from "@/components/ui/ascii-bar";
import {
    getAnalyticsForWindow,
    type AggregatedAnalytics,
} from "@/lib/utils/analytics";
import {
    getActiveTimeSegments,
    type ActiveTimeSegmentKey,
} from "@/lib/utils/dashboard-segments";
import type { AnalyticsData, LookbackWindow } from "@/types/analytics";

interface DashboardProps {
    analyticsData: AnalyticsData | null;
}

const LOOKBACK_OPTIONS: { value: LookbackWindow; label: string }[] = [
    { value: "7d", label: "7 Days" },
    { value: "14d", label: "14 Days" },
    { value: "30d", label: "30 Days" },
];

const formatHours = (hours: number): string => {
    if (hours < 1) {
        return `${Math.round(hours * 60)}m`;
    }
    return `${hours.toFixed(1)}h`;
};

const formatPercent = (percentage: number): string => {
    if (percentage > 0 && percentage < 1) {
        return "<1%";
    }
    return `${percentage.toFixed(0)}%`;
};

const SEGMENT_COLORS: Record<ActiveTimeSegmentKey, string> = {
    dev: "data.dev",
    design: "data.design",
    other: "data.other",
};

const LookbackSelector = ({
    selected,
    onChange,
}: {
    selected: LookbackWindow;
    onChange: (window: LookbackWindow) => void;
}) => (
    <HStack gap={2}>
        {LOOKBACK_OPTIONS.map((option) => (
            <Box
                key={option.value}
                as="button"
                px={3}
                py={1}
                fontSize="sm"
                fontFamily="heading"
                borderRadius="md"
                cursor="pointer"
                transition="all 0.2s"
                bg={selected === option.value ? "accent.subtle" : "transparent"}
                color={selected === option.value ? "accent.emphasized" : "fg.muted"}
                borderWidth="1px"
                borderColor={selected === option.value ? "edge.accent" : "edge.default"}
                _hover={{
                    borderColor: "accent",
                    color: "accent.emphasized",
                }}
                onClick={() => onChange(option.value)}
            >
                {option.label}
            </Box>
        ))}
    </HStack>
);

const ActiveTimeRail = ({
    analytics,
}: {
    analytics: AggregatedAnalytics;
}) => {
    const segments = getActiveTimeSegments(analytics);

    return (
        <Stack gap={4}>
            <HStack
                gap={0}
                h="18px"
                w="full"
                overflow="hidden"
                borderWidth="1px"
                borderColor="edge.default"
                borderRadius="l2"
                bg="data.rail"
            >
                {segments.map((segment) => {
                    if (segment.hours === 0) return null;

                    return (
                        <Box
                            key={segment.key}
                            h="full"
                            flex={`${segment.hours} 1 0`}
                            minW={segment.percentage > 0 && segment.percentage < 1 ? "3px" : undefined}
                            bg={SEGMENT_COLORS[segment.key]}
                            opacity={segment.key === "other" ? 0.45 : 0.9}
                        />
                    );
                })}
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                {segments.map((segment) => (
                    <Stack
                        key={segment.key}
                        gap={1}
                        p={3}
                        borderWidth="1px"
                        borderColor="edge.muted"
                        borderRadius="l2"
                        bg="surface.page/60"
                    >
                        <HStack justify="space-between" fontFamily="mono" fontSize="sm">
                            <Text color={SEGMENT_COLORS[segment.key]}>{segment.label}</Text>
                            <Text color="fg.muted">{formatHours(segment.hours)}</Text>
                        </HStack>
                        <Text fontSize="xs" color="text.meta" fontFamily="mono">
                            {formatPercent(segment.percentage)} of active time
                        </Text>
                    </Stack>
                ))}
            </SimpleGrid>
        </Stack>
    );
};

const ActiveTimeCard = ({
    analytics,
}: {
    analytics: AggregatedAnalytics;
}) => {
    return (
        <Card.Root size="sm" borderColor="edge.muted" bg="surface.panel">
            <Card.Header>
                <Card.Title fontFamily="heading" fontSize="sm">
                    Active time allocation
                </Card.Title>
            </Card.Header>
            <Card.Body>
                <Stack gap={5}>
                    <ActiveTimeRail analytics={analytics} />
                    <HStack justify="space-between" fontSize="xs" color="text.meta" fontFamily="mono" wrap="wrap" gap={2}>
                        <Text>AI chat counted under design: {formatHours(analytics.aiChatTime.hours)}</Text>
                        <Text>Total active: {formatHours(analytics.totalActiveTime.hours)}</Text>
                    </HStack>
                </Stack>
            </Card.Body>
        </Card.Root>
    );
};

const DevToolsCard = ({ analytics }: { analytics: AggregatedAnalytics }) => {
    const barData = analytics.devToolsBreakdown.slice(0, 8).map((item) => ({
        name: item.name,
        value: item.percentage,
    }));

    if (barData.length === 0) {
        return (
            <Card.Root size="sm" borderColor="edge.muted" bg="surface.panel">
                <Card.Header>
                    <Card.Title fontFamily="heading" fontSize="sm">
                        Dev Tools
                    </Card.Title>
                </Card.Header>
                <Card.Body>
                    <Text color="fg.muted" fontSize="sm">
                        no data yet.
                    </Text>
                </Card.Body>
            </Card.Root>
        );
    }

    return (
        <Card.Root size="sm" borderColor="edge.muted" bg="surface.panel">
            <Card.Header>
                <Card.Title fontFamily="heading" fontSize="sm">
                    Dev Tools
                </Card.Title>
            </Card.Header>
            <Card.Body>
                <AsciiBarList
                    data={barData}
                    barWidth={16}
                    color="data.dev"
                    showValue={true}
                    valueSuffix="%"
                />
            </Card.Body>
        </Card.Root>
    );
};

const AiChatsCard = ({ analytics }: { analytics: AggregatedAnalytics }) => {
    const barData = analytics.aiChatsBreakdown.slice(0, 8).map((item) => ({
        name: item.name,
        value: item.percentage,
    }));

    if (barData.length === 0) {
        return (
            <Card.Root size="sm" borderColor="edge.muted" bg="surface.panel">
                <Card.Header>
                    <Card.Title fontFamily="heading" fontSize="sm">
                        AI Chats
                    </Card.Title>
                </Card.Header>
                <Card.Body>
                    <Text color="fg.muted" fontSize="sm">
                        no data yet.
                    </Text>
                </Card.Body>
            </Card.Root>
        );
    }

    return (
        <Card.Root size="sm" borderColor="edge.muted" bg="surface.panel">
            <Card.Header>
                <Card.Title fontFamily="heading" fontSize="sm">
                    AI Chats
                </Card.Title>
            </Card.Header>
            <Card.Body>
                <AsciiBarList
                    data={barData}
                    barWidth={16}
                    color="data.design"
                    showValue={true}
                    valueSuffix="%"
                />
            </Card.Body>
        </Card.Root>
    );
};

const NoDataMessage = () => (
    <Box textAlign="center" py={12}>
        <Text color="fg.muted" fontSize="lg">
            no data yet.
        </Text>
    </Box>
);

export default function Dashboard({ analyticsData: initialData }: DashboardProps) {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(initialData);
    const [lookback, setLookback] = useState<LookbackWindow>("7d");

    // Fetch fresh data client-side to handle browser-cached pages
    useEffect(() => {
        fetch("/api/analytics")
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
                if (data && data.generated_at !== initialData?.generated_at) {
                    setAnalyticsData(data);
                }
            })
            .catch(() => {}); // Silently fail, we have ISR data as fallback
    }, [initialData?.generated_at]);

    const analytics = useMemo(() => {
        if (!analyticsData) return null;
        return getAnalyticsForWindow(analyticsData, lookback);
    }, [analyticsData, lookback]);

    return (
        <Box py={{ base: 8, md: 12 }}>
            <Container maxW="container.lg">
                <Stack gap={8}>
                    <Stack gap={4}>
                        <Heading
                            size="2xl"
                            fontFamily="heading"
                            letterSpacing="wide"
                        >
                            time accounting
                        </Heading>
                        <Text color="fg.muted" fontSize="sm" fontFamily="mono">
                            How my workflows and AI use have shifted.
                        </Text>
                    </Stack>

                    {!analyticsData || !analytics ? (
                        <NoDataMessage />
                    ) : (
                        <>
                            <Flex justify="space-between" align="center" fontFamily="mono" wrap="wrap" gap={2}>
                                <Stack gap={0}>
                                    <Text color="fg.muted" fontSize="sm">
                                        {analytics.daysIncluded} days of data
                                    </Text>
                                    {analyticsData.generated_at && (
                                        <Text color="fg.muted" fontSize="xs">
                                            Last updated: {new Date(analyticsData.generated_at).toLocaleDateString()}
                                        </Text>
                                    )}
                                </Stack>
                                <LookbackSelector selected={lookback} onChange={setLookback} />
                            </Flex>

                            <Stack gap={6}>
                                <ActiveTimeCard analytics={analytics} />

                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                                    <DevToolsCard analytics={analytics} />
                                    <AiChatsCard analytics={analytics} />
                                </SimpleGrid>
                            </Stack>
                        </>
                    )}
                </Stack>
            </Container>
        </Box>
    );
}

export const getStaticProps: GetStaticProps<DashboardProps> = async () => {
    const fs = await import("fs/promises");
    const path = await import("path");

    let analyticsData: AnalyticsData | null = null;

    try {
        const dataDir = path.join(process.cwd(), "data");
        const files = await fs.readdir(dataDir);

        const analyticsFiles = files.filter(
            (f: string) => f === "aw_analytics.json" || f.match(/^\d{6}_aw_analytics\.json$/)
        );

        if (analyticsFiles.length > 0) {
            // Sort dated files (YYMMDD_aw_analytics.json) first, then by date descending
            const datedFiles = analyticsFiles
                .filter((f: string) => f.match(/^\d{6}_aw_analytics\.json$/))
                .sort()
                .reverse();
            const latestFile = datedFiles.length > 0 ? datedFiles[0] : analyticsFiles[0];
            const filePath = path.join(dataDir, latestFile);
            const content = await fs.readFile(filePath, "utf8");
            analyticsData = JSON.parse(content) as AnalyticsData;
        }
    } catch (error) {
        console.error("Error loading analytics data:", error);
    }

    return {
        props: {
            analyticsData,
        },
        revalidate: 3600, // Revalidate every hour
    };
};
