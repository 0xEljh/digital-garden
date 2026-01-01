import type {
  AnalyticsData,
  AnalyticsReport,
  BreakdownItem,
  LookbackWindow,
} from "@/types/analytics";

/**
 * Aggregate daily reports within a lookback window
 */
export const aggregateDailyReports = (
  dailyReports: AnalyticsReport[],
  lookbackDays: number
): AggregatedAnalytics => {
  const now = new Date();
  const cutoffDate = new Date(now);
  cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);

  // Filter reports within the lookback window
  const filteredReports = dailyReports.filter((report) => {
    const reportDate = new Date(report.period.start_date);
    return reportDate >= cutoffDate && reportDate <= now;
  });

  if (filteredReports.length === 0) {
    return createEmptyAggregate();
  }

  // Aggregate totals
  let totalDevSeconds = 0;
  let totalPlanningSeconds = 0;
  let totalAiChatSeconds = 0;
  let totalActiveSeconds = 0;

  const devToolsMap = new Map<string, number>();
  const aiChatsMap = new Map<string, number>();

  for (const report of filteredReports) {
    totalDevSeconds += report.summary.dev_time.seconds;
    totalPlanningSeconds += report.summary.planning_time.seconds;
    totalAiChatSeconds += report.summary.ai_chat_time.seconds;
    totalActiveSeconds += report.summary.total_active_time.seconds;

    // Aggregate dev tools
    for (const item of report.dev_tools_breakdown) {
      const current = devToolsMap.get(item.name) || 0;
      devToolsMap.set(item.name, current + item.seconds);
    }

    // Aggregate AI chats
    for (const item of report.ai_chats_breakdown) {
      const current = aiChatsMap.get(item.name) || 0;
      aiChatsMap.set(item.name, current + item.seconds);
    }
  }

  // Calculate proportions
  const devToolsBreakdown = calculateBreakdown(devToolsMap);
  const aiChatsBreakdown = calculateBreakdown(aiChatsMap);

  const totalFocusedTime = totalDevSeconds + totalPlanningSeconds;
  const devRatio =
    totalFocusedTime > 0 ? totalDevSeconds / totalFocusedTime : 0;
  const planningRatio =
    totalFocusedTime > 0 ? totalPlanningSeconds / totalFocusedTime : 0;

  return {
    devTime: {
      hours: totalDevSeconds / 3600,
      percentage: devRatio * 100,
    },
    planningTime: {
      hours: totalPlanningSeconds / 3600,
      percentage: planningRatio * 100,
    },
    aiChatTime: {
      hours: totalAiChatSeconds / 3600,
    },
    totalActiveTime: {
      hours: totalActiveSeconds / 3600,
    },
    devToolsBreakdown,
    aiChatsBreakdown,
    daysIncluded: filteredReports.length,
  };
};

/**
 * Calculate breakdown with proportions from a map
 */
const calculateBreakdown = (map: Map<string, number>): BreakdownItem[] => {
  const total = Array.from(map.values()).reduce((sum, val) => sum + val, 0);
  if (total === 0) return [];

  return Array.from(map.entries())
    .map(([name, seconds]) => ({
      name,
      seconds,
      minutes: seconds / 60,
      hours: seconds / 3600,
      proportion: seconds / total,
      percentage: (seconds / total) * 100,
    }))
    .sort((a, b) => b.seconds - a.seconds);
};

/**
 * Create empty aggregate for when no data is available
 */
const createEmptyAggregate = (): AggregatedAnalytics => ({
  devTime: { hours: 0, percentage: 0 },
  planningTime: { hours: 0, percentage: 0 },
  aiChatTime: { hours: 0 },
  totalActiveTime: { hours: 0 },
  devToolsBreakdown: [],
  aiChatsBreakdown: [],
  daysIncluded: 0,
});

/**
 * Get aggregated analytics for a specific lookback window
 */
export const getAnalyticsForWindow = (
  data: AnalyticsData,
  window: LookbackWindow
): AggregatedAnalytics => {
  const lookbackDays = window === "7d" ? 7 : window === "14d" ? 14 : 30;
  return aggregateDailyReports(data.daily, lookbackDays);
};

export interface AggregatedAnalytics {
  devTime: {
    hours: number;
    percentage: number;
  };
  planningTime: {
    hours: number;
    percentage: number;
  };
  aiChatTime: {
    hours: number;
  };
  totalActiveTime: {
    hours: number;
  };
  devToolsBreakdown: BreakdownItem[];
  aiChatsBreakdown: BreakdownItem[];
  daysIncluded: number;
}
