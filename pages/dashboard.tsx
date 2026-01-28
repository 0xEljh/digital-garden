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
import { BarList } from "@/components/ui/blocks/charts/bar-list";
import {
    getAnalyticsForWindow,
    type AggregatedAnalytics,
} from "@/lib/utils/analytics";
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
                fontFamily="Tickerbit"
                borderRadius="md"
                cursor="pointer"
                transition="all 0.2s"
                bg={selected === option.value ? "cyan.900" : "transparent"}
                color={selected === option.value ? "cyan.100" : "fg.muted"}
                borderWidth="1px"
                borderColor={selected === option.value ? "cyan.700" : "gray.700"}
                _hover={{
                    borderColor: "cyan.600",
                    color: "cyan.200",
                }}
                onClick={() => onChange(option.value)}
            >
                {option.label}
            </Box>
        ))}
    </HStack>
);

const DevPlanningRatioCard = ({
    analytics,
}: {
    analytics: AggregatedAnalytics;
}) => {
    const devWidth = analytics.devTime.percentage;
    const planningWidth = analytics.planningTime.percentage;
    const activeTime = analytics.devTime.hours + analytics.planningTime.hours;

    return (
        <Card.Root size="sm">
            <Card.Header>
                <Card.Title fontFamily="Tickerbit" fontSize="sm">
                    Time spent on Dev vs Design
                </Card.Title>
            </Card.Header>
            <Card.Body>
                <Stack gap={4}>
                    <HStack justify="space-between" fontSize="sm" fontFamily="Aeion Mono">
                        <Text color="cyan.300">
                            Dev: {formatHours(analytics.devTime.hours)} (
                            {analytics.devTime.percentage.toFixed(0)}%)
                        </Text>
                        <Text color="purple.300">
                            Design: {formatHours(analytics.planningTime.hours)} (
                            {analytics.planningTime.percentage.toFixed(0)}%)
                        </Text>
                    </HStack>
                    <Box h="8px" bg="gray.800" borderRadius="full" overflow="hidden">
                        <HStack gap={0} h="full">
                            <Box
                                h="full"
                                bg="cyan.500"
                                w={`${devWidth}%`}
                                transition="width 0.3s"
                            />
                            <Box
                                h="full"
                                bg="purple.500"
                                w={`${planningWidth}%`}
                                transition="width 0.3s"
                            />
                        </HStack>
                    </Box>
                    <Box>
                        <Stack fontSize="xs" color="fg.muted" fontFamily="Aeion Mono" align="flex-end">
                            <HStack justify="space-between">
                                <Text>AI Chat (design):</Text>
                                <Text>{formatHours(analytics.aiChatTime.hours)}</Text>
                            </HStack>
                            <HStack justify="space-between">
                                <Text>Total time:</Text>
                                <Text>{formatHours(activeTime)}</Text>
                            </HStack>

                        </Stack>
                    </Box>
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
            <Card.Root size="sm">
                <Card.Header>
                    <Card.Title fontFamily="Tickerbit" fontSize="sm">
                        Dev Tools
                    </Card.Title>
                </Card.Header>
                <Card.Body>
                    <Text color="fg.muted" fontSize="sm">
                        No dev tool data available
                    </Text>
                </Card.Body>
            </Card.Root>
        );
    }

    return (
        <Card.Root size="sm">
            <Card.Header>
                <Card.Title fontFamily="Tickerbit" fontSize="sm">
                    Dev Tools
                </Card.Title>
            </Card.Header>
            <Card.Body>
                <BarList
                    data={barData}
                    labels={{ title: "Tool", value: "%" }}
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
            <Card.Root size="sm">
                <Card.Header>
                    <Card.Title fontFamily="Tickerbit" fontSize="sm">
                        AI Chats
                    </Card.Title>
                </Card.Header>
                <Card.Body>
                    <Text color="fg.muted" fontSize="sm">
                        No AI chat data available
                    </Text>
                </Card.Body>
            </Card.Root>
        );
    }

    return (
        <Card.Root size="sm">
            <Card.Header>
                <Card.Title fontFamily="Tickerbit" fontSize="sm">
                    AI Chats
                </Card.Title>
            </Card.Header>
            <Card.Body>
                <BarList
                    data={barData}
                    labels={{ title: "Service", value: "%" }}
                />
            </Card.Body>
        </Card.Root>
    );
};

const NoDataMessage = () => (
    <Box textAlign="center" py={12}>
        <Text color="fg.muted" fontSize="lg">
            No analytics data available.
        </Text>
        <Text color="fg.muted" fontSize="sm" mt={2}>
            Analytics data will appear here once exported.
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
                            fontFamily="Topoline"
                            fontWeight="100"
                            letterSpacing="wide"
                        >
                            Time Accounting
                        </Heading>
                        <Text color="fg.muted" fontSize="sm" fontFamily="Aeion Mono">
                            Tracking the evolution of my workflows and AI use
                        </Text>
                    </Stack>

                    {!analyticsData || !analytics ? (
                        <NoDataMessage />
                    ) : (
                        <>
                            <Flex justify="space-between" align="center" fontFamily="Aeion Mono" wrap="wrap" gap={2}>
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
                                <DevPlanningRatioCard analytics={analytics} />

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
