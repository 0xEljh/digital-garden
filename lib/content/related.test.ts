import { describe, expect, test } from "bun:test";
import { deriveRelated } from "./related";
import type { RelatedCandidate, RelatedTarget } from "./related";
import type { GraphEdge } from "./link-graph";

const edge = (to: string, kind: GraphEdge["kind"]): GraphEdge => ({ to, kind });

const target = (over: Partial<RelatedTarget> = {}): RelatedTarget => ({
  slug: "t",
  categories: [],
  outgoing: [],
  ...over,
});

const cand = (
  slug: string,
  over: Partial<RelatedCandidate> = {}
): RelatedCandidate => ({
  slug,
  title: slug.toUpperCase(),
  categories: [],
  date: "2026-01-01",
  stage: "sighted",
  ...over,
});

describe("deriveRelated", () => {
  test("ranks manual related > inline mention > shared category", () => {
    const t = target({
      categories: ["deep learning"],
      outgoing: [edge("m", "related"), edge("i", "inline")],
    });
    const picks = deriveRelated(t, [
      cand("s", { categories: ["deep learning"] }),
      cand("i"),
      cand("m"),
    ]);
    expect(picks.map((p) => p.slug)).toEqual(["m", "i", "s"]);
    expect(picks.map((p) => p.reason)).toEqual(["related", "linked", "shared"]);
  });

  test("a category-only neighbor still surfaces (the C6 win)", () => {
    const t = target({ categories: ["math"] });
    const picks = deriveRelated(t, [cand("a", { categories: ["math"] })]);
    expect(picks).toHaveLength(1);
    expect(picks[0]).toMatchObject({
      slug: "a",
      reason: "shared",
      sharedCategory: "math",
    });
  });

  test("excludes the target itself even if self-linked", () => {
    const t = target({
      slug: "t",
      categories: ["x"],
      outgoing: [edge("t", "related")],
    });
    expect(deriveRelated(t, [cand("t", { categories: ["x"] })])).toEqual([]);
  });

  test("drops candidates with no signal", () => {
    const t = target({ categories: ["math"] });
    expect(deriveRelated(t, [cand("unrelated", { categories: ["cooking"] })])).toEqual(
      []
    );
  });

  test("respects the limit", () => {
    const t = target({ categories: ["x"] });
    const many = ["a", "b", "c", "d"].map((s) => cand(s, { categories: ["x"] }));
    expect(deriveRelated(t, many, 2)).toHaveLength(2);
  });

  test("breaks ties by recency, then slug, for determinism", () => {
    const t = target({ categories: ["x"] });
    const picks = deriveRelated(t, [
      cand("older", { categories: ["x"], date: "2025-01-01" }),
      cand("zeta", { categories: ["x"], date: "2026-06-01" }),
      cand("alpha", { categories: ["x"], date: "2026-06-01" }),
    ]);
    // same score (1): newest first; alpha before zeta on equal dates
    expect(picks.map((p) => p.slug)).toEqual(["alpha", "zeta", "older"]);
  });

  test("an edge candidate that also shares a category keeps the edge reason but outscores a plain edge", () => {
    const t = target({
      categories: ["nlp"],
      outgoing: [edge("both", "inline"), edge("plain", "inline")],
    });
    const picks = deriveRelated(t, [
      cand("plain"),
      cand("both", { categories: ["nlp"] }),
    ]);
    expect(picks.map((p) => p.slug)).toEqual(["both", "plain"]); // 3 vs 2
    expect(picks.find((p) => p.slug === "both")?.reason).toBe("linked");
    expect(picks.find((p) => p.slug === "both")?.sharedCategory).toBeUndefined();
  });

  test("multiple shared categories accumulate score", () => {
    const t = target({ categories: ["a", "b"] });
    const picks = deriveRelated(t, [
      cand("one", { categories: ["a"] }),
      cand("two", { categories: ["a", "b"] }),
    ]);
    expect(picks.map((p) => p.slug)).toEqual(["two", "one"]); // 2 vs 1
  });
});
