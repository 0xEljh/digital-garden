export interface TimeValue {
  seconds: number;
  minutes: number;
  hours: number;
}

export interface BreakdownItem {
  name: string;
  seconds: number;
  minutes: number;
  hours: number;
  proportion: number;
  percentage: number;
}

export interface DevPlanningRatio {
  dev: number;
  planning: number;
}

export interface PeriodSummary {
  total_active_time: TimeValue;
  dev_time: TimeValue;
  planning_time: TimeValue;
  ai_chat_time: TimeValue;
  dev_vs_planning_ratio: DevPlanningRatio;
}

export interface Period {
  type: "daily" | "weekly" | "monthly";
  label: string;
  start_date: string;
  end_date: string;
}

export interface AnalyticsReport {
  period: Period;
  summary: PeriodSummary;
  dev_tools_breakdown: BreakdownItem[];
  ai_chats_breakdown: BreakdownItem[];
  planning_breakdown: BreakdownItem[];
  top_apps: BreakdownItem[];
}

export interface AnalyticsData {
  generated_at: string;
  timezone: string;
  lookback_days: number;
  daily: AnalyticsReport[];
  weekly: AnalyticsReport[];
  monthly: AnalyticsReport[];
}

export type LookbackWindow = "7d" | "14d" | "30d";
