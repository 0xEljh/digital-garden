import type { AggregatedAnalytics } from "./analytics";

export type ActiveTimeSegmentKey = "dev" | "design" | "other";

export interface ActiveTimeSegment {
  key: ActiveTimeSegmentKey;
  label: string;
  hours: number;
  percentage: number;
}

export const getActiveTimeSegments = (
  analytics: AggregatedAnalytics
): ActiveTimeSegment[] => {
  const devHours = Math.max(0, analytics.devTime.hours);
  const designHours = Math.max(0, analytics.planningTime.hours);
  const focusedHours = devHours + designHours;
  const totalHours = Math.max(0, analytics.totalActiveTime.hours, focusedHours);
  const otherHours = Math.max(0, totalHours - focusedHours);
  const denominator = totalHours > 0 ? totalHours : 1;

  return [
    {
      key: "dev",
      label: "Dev",
      hours: devHours,
      percentage: totalHours > 0 ? (devHours / denominator) * 100 : 0,
    },
    {
      key: "design",
      label: "Design",
      hours: designHours,
      percentage: totalHours > 0 ? (designHours / denominator) * 100 : 0,
    },
    {
      key: "other",
      label: "Other active",
      hours: otherHours,
      percentage: totalHours > 0 ? (otherHours / denominator) * 100 : 0,
    },
  ];
};
