import { describe, expect, test } from "bun:test";
import {
  buildGardenLayout,
  FIELD_WIDTH,
  HORIZON_Y,
  type GardenPostInput,
} from "./layout";
import type { GraphEdge } from "@/lib/content/link-graph";
import type { Stage } from "@/lib/content/schema";

const post = (
  slug: string,
  categories: string[],
  outgoing: GraphEdge[] = [],
  stage: Stage = "seedling"
): GardenPostInput => ({ slug, title: slug, stage, categories, outgoing });

// Mirrors the real corpus' category frequencies (dl 4 · math 3 · triton 2 · pytorch/life/analytics 1).
const corpus: GardenPostInput[] = [
  post("classic-sgd", ["deep learning", "math", "pytorch"]),
  post("cross-entropy", ["deep learning", "math"]),
  post("cut-cce", ["deep learning", "math", "triton"]),
  post("intro-gpu", ["deep learning", "triton"]),
  post("time", ["life", "analytics"]),
  post("transformer", []),
];

describe("buildGardenLayout", () => {
  const layout = buildGardenLayout(corpus);
  const bedOf = (slug: string) =>
    layout.plants.find((p) => p.slug === slug)?.bed;

  test("places every post exactly once", () => {
    expect(layout.plants).toHaveLength(corpus.length);
    expect(layout.plants.map((p) => p.slug).sort()).toEqual(
      corpus.map((p) => p.slug).sort()
    );
  });

  test("files a post under its rarest (most specific) category", () => {
    expect(bedOf("classic-sgd")).toBe("pytorch"); // 1 < math 3 < dl 4
    expect(bedOf("cross-entropy")).toBe("math"); // 3 < dl 4
    expect(bedOf("cut-cce")).toBe("triton"); // 2 — rarest
    expect(bedOf("intro-gpu")).toBe("triton");
  });

  test("breaks frequency ties by authorial order (first category wins)", () => {
    expect(bedOf("time")).toBe("life"); // life & analytics both 1 → first listed
  });

  test("files an uncategorized post in the wild bed", () => {
    expect(bedOf("transformer")).toBe("wild");
  });

  test("beds partition the posts", () => {
    expect(layout.beds.flatMap((b) => b.plantSlugs).sort()).toEqual(
      corpus.map((p) => p.slug).sort()
    );
  });

  test("resolves edges to plant centers, carrying edge kind", () => {
    const l = buildGardenLayout([
      post("a", ["x"], [{ to: "b", kind: "related" }]),
      post("b", ["y"]),
    ]);
    expect(l.edges).toHaveLength(1);
    const [e] = l.edges;
    const a = l.plants.find((p) => p.slug === "a")!;
    const b = l.plants.find((p) => p.slug === "b")!;
    expect([e.x1, e.y1]).toEqual([a.x, a.y]);
    expect([e.x2, e.y2]).toEqual([b.x, b.y]);
    expect(e.kind).toBe("related");
  });

  test("drops edges pointing at unplaced targets", () => {
    const l = buildGardenLayout([
      post("a", ["x"], [{ to: "ghost", kind: "inline" }]),
    ]);
    expect(l.edges).toHaveLength(0);
  });

  test("is deterministic", () => {
    expect(buildGardenLayout(corpus)).toEqual(layout);
  });

  test("reports positive scene dimensions", () => {
    expect(layout.width).toBeGreaterThan(0);
    expect(layout.height).toBeGreaterThan(0);
  });

  // --- field scene (side-view) ---------------------------------------------

  test("composes a fixed full-width banner (fills the frame, not an island)", () => {
    expect(layout.width).toBe(FIELD_WIDTH);
    expect(layout.width).toBeGreaterThan(layout.height);
  });

  test("roots every plant on a single ground horizon", () => {
    const ys = new Set(layout.plants.map((p) => p.y));
    expect(ys.size).toBe(1);
    expect([...ys][0]).toBe(HORIZON_Y);
  });

  test("lays beds as ground bands seated on the horizon", () => {
    expect(layout.beds.length).toBeGreaterThan(0);
    expect(layout.beds.every((b) => b.y === HORIZON_Y)).toBe(true);
  });

  test("orders beds left-to-right without horizontal overlap", () => {
    const sorted = [...layout.beds].sort((a, b) => a.x - b.x);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].x).toBeGreaterThanOrEqual(
        sorted[i - 1].x + sorted[i - 1].w - 0.01
      );
    }
  });
});
