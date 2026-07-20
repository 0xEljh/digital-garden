import { describe, expect, test } from "bun:test";
import type { GraphEdge } from "@/lib/content/link-graph";
import type { Stage } from "@/lib/content/schema";
import {
  buildStarChartLayout,
  CHART_HEIGHT,
  CHART_WIDTH,
  type ChartPostInput,
} from "./layout";

const post = (
  slug: string,
  categories: string[],
  outgoing: GraphEdge[] = [],
  stage: Stage = "sighted",
): ChartPostInput => ({ slug, title: slug, stage, categories, outgoing });

const corpus: ChartPostInput[] = [
  post("classic-sgd", ["deep learning", "math", "pytorch"], [], "charted"),
  post("cross-entropy", ["deep learning", "math"], [], "mapped"),
  post("cut-cce", ["deep learning", "math", "triton"], [], "charted"),
  post("intro-gpu", ["deep learning", "triton"], [], "sighted"),
  post("time", ["life", "analytics"], [], "charted"),
  post("transformer", [], [], "sighted"),
];

describe("buildStarChartLayout", () => {
  const layout = buildStarChartLayout(corpus);
  const clusterOf = (slug: string) =>
    layout.nodes.find((node) => node.slug === slug)?.cluster;

  test("places every post exactly once", () => {
    expect(layout.nodes).toHaveLength(corpus.length);
    expect(layout.nodes.map((node) => node.slug).sort()).toEqual(
      corpus.map((p) => p.slug).sort(),
    );
  });

  test("clusters a post under its rarest category", () => {
    expect(clusterOf("classic-sgd")).toBe("pytorch");
    expect(clusterOf("cross-entropy")).toBe("math");
    expect(clusterOf("cut-cce")).toBe("triton");
    expect(clusterOf("intro-gpu")).toBe("triton");
  });

  test("breaks frequency ties by authorial category order", () => {
    expect(clusterOf("time")).toBe("life");
  });

  test("files uncategorized posts as uncharted", () => {
    expect(clusterOf("transformer")).toBe("uncharted");
  });

  test("keeps every node inside the viewBox", () => {
    expect(layout.width).toBe(CHART_WIDTH);
    expect(layout.height).toBe(CHART_HEIGHT);
    for (const node of layout.nodes) {
      expect(node.x).toBeGreaterThanOrEqual(0);
      expect(node.x).toBeLessThanOrEqual(layout.width);
      expect(node.y).toBeGreaterThanOrEqual(0);
      expect(node.y).toBeLessThanOrEqual(layout.height);
      expect(Number.isFinite(node.x)).toBe(true);
      expect(Number.isFinite(node.y)).toBe(true);
    }
  });

  test("resolves edges to node centers and preserves edge kind", () => {
    const l = buildStarChartLayout([
      post("a", ["x"], [{ to: "b", kind: "related" }]),
      post("b", ["y"]),
    ]);
    expect(l.edges).toHaveLength(1);
    const [edge] = l.edges;
    const a = l.nodes.find((node) => node.slug === "a")!;
    const b = l.nodes.find((node) => node.slug === "b")!;
    expect([edge.x1, edge.y1]).toEqual([a.x, a.y]);
    expect([edge.x2, edge.y2]).toEqual([b.x, b.y]);
    expect(edge.kind).toBe("related");
  });

  test("drops edges pointing at missing targets", () => {
    const l = buildStarChartLayout([
      post("a", ["x"], [{ to: "ghost", kind: "inline" }]),
    ]);
    expect(l.edges).toEqual([]);
  });

  test("is deterministic", () => {
    expect(buildStarChartLayout(corpus)).toEqual(layout);
  });

  test("is invariant to input and outgoing-edge order", () => {
    const linkedCorpus = [
      post("a", ["shared"], [
        { to: "c", kind: "related" },
        { to: "b", kind: "inline" },
      ]),
      post("b", ["shared"]),
      post("c", ["shared"]),
    ];
    const reordered = [...linkedCorpus]
      .reverse()
      .map((item) => ({ ...item, outgoing: [...item.outgoing].reverse() }));

    expect(buildStarChartLayout(reordered)).toEqual(
      buildStarChartLayout(linkedCorpus),
    );
  });

  test("handles empty and single-entry inputs without NaN", () => {
    expect(buildStarChartLayout([]).nodes).toEqual([]);
    const [node] = buildStarChartLayout([post("solo", [])]).nodes;
    expect(Number.isFinite(node.x)).toBe(true);
    expect(Number.isFinite(node.y)).toBe(true);
  });
});
