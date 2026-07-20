import { describe, expect, test } from "bun:test";
import { getActiveTimeSegments } from "./dashboard-segments";
import type { AggregatedAnalytics } from "./analytics";

const analyticsWithHours = ({
  dev,
  design,
  active,
}: {
  dev: number;
  design: number;
  active: number;
}): AggregatedAnalytics => ({
  devTime: { hours: dev, percentage: 0 },
  planningTime: { hours: design, percentage: 0 },
  aiChatTime: { hours: 0 },
  totalActiveTime: { hours: active },
  devToolsBreakdown: [],
  aiChatsBreakdown: [],
  daysIncluded: 7,
});

describe("getActiveTimeSegments", () => {
  test("uses total active time as the denominator", () => {
    const segments = getActiveTimeSegments(
      analyticsWithHours({ dev: 1, design: 3, active: 10 })
    );

    expect(segments.map((segment) => segment.key)).toEqual([
      "dev",
      "design",
      "other",
    ]);
    expect(segments.map((segment) => segment.hours)).toEqual([1, 3, 6]);
    expect(segments.map((segment) => segment.percentage)).toEqual([10, 30, 60]);
  });

  test("does not create negative other time when focused time exceeds active time", () => {
    const segments = getActiveTimeSegments(
      analyticsWithHours({ dev: 2, design: 3, active: 4 })
    );

    expect(segments.map((segment) => segment.hours)).toEqual([2, 3, 0]);
    expect(segments.map((segment) => segment.percentage)).toEqual([40, 60, 0]);
  });

  test("handles empty analytics without NaN percentages", () => {
    const segments = getActiveTimeSegments(
      analyticsWithHours({ dev: 0, design: 0, active: 0 })
    );

    expect(segments.map((segment) => segment.percentage)).toEqual([0, 0, 0]);
  });
});
