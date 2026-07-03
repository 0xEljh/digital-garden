/**
 * Pure, deterministic layout for the expedition star chart. Turns posts into
 * chart nodes clustered by rarest category, plus graph edge endpoints, all in
 * viewBox units with no DOM, Date, or random dependency.
 */
import type { GraphEdge } from "@/lib/content/link-graph";
import type { Stage } from "@/lib/content/schema";

export interface ChartPostInput {
  slug: string;
  title: string;
  stage: Stage;
  categories: string[];
  outgoing: GraphEdge[];
}

export interface ChartNode {
  slug: string;
  title: string;
  stage: Stage;
  /** Primary constellation key — the post's rarest category, or "uncharted". */
  cluster: string;
  x: number;
  y: number;
  r: number;
  brightness: number;
}

export interface ChartCluster {
  key: string;
  label: string;
  cx: number;
  cy: number;
  r: number;
  nodeSlugs: string[];
}

export interface ChartEdge {
  from: string;
  to: string;
  kind: GraphEdge["kind"];
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface StarChartLayout {
  width: number;
  height: number;
  clusters: ChartCluster[];
  nodes: ChartNode[];
  edges: ChartEdge[];
}

export const CHART_WIDTH = 1000;
export const CHART_HEIGHT = 360;
const MARGIN = 44;
const CENTER_X = CHART_WIDTH / 2;
const CENTER_Y = CHART_HEIGHT / 2;

const STATE_RENDERING: Record<Stage, { r: number; brightness: number }> = {
  sighted: { r: 5, brightness: 0.62 },
  charted: { r: 7, brightness: 0.82 },
  mapped: { r: 9, brightness: 1 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Pick a post's constellation: its rarest category (tie -> authorial order). */
function rarestCategory(categories: string[], freq: Map<string, number>): string {
  let best: string | null = null;
  let bestFreq = Infinity;
  for (const category of categories) {
    const f = freq.get(category) ?? 0;
    if (f < bestFreq) {
      best = category;
      bestFreq = f;
    }
  }
  return best ?? "uncharted";
}

function clusterCenter(index: number, total: number): { x: number; y: number } {
  if (total <= 1) return { x: CENTER_X, y: CENTER_Y };
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total;
  return {
    x: CENTER_X + Math.cos(angle) * 310,
    y: CENTER_Y + Math.sin(angle) * 105,
  };
}

function keepInBounds(node: ChartNode): ChartNode {
  return {
    ...node,
    x: clamp(node.x, MARGIN, CHART_WIDTH - MARGIN),
    y: clamp(node.y, MARGIN, CHART_HEIGHT - MARGIN),
  };
}

function relax(nodes: ChartNode[]): ChartNode[] {
  let current = nodes.map(keepInBounds);
  const minDistance = 34;

  for (let pass = 0; pass < 12; pass++) {
    const next = current.map((node) => ({ ...node }));
    for (let i = 0; i < next.length; i++) {
      for (let j = i + 1; j < next.length; j++) {
        const a = next[i];
        const b = next[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.001;
        if (d >= minDistance) continue;

        const push = (minDistance - d) / 2;
        const ux = dx / d;
        const uy = dy / d;
        a.x -= ux * push;
        a.y -= uy * push;
        b.x += ux * push;
        b.y += uy * push;
      }
    }
    current = next.map(keepInBounds);
  }

  return current;
}

export function buildStarChartLayout(posts: ChartPostInput[]): StarChartLayout {
  const freq = new Map<string, number>();
  for (const post of posts) {
    for (const category of post.categories) {
      freq.set(category, (freq.get(category) ?? 0) + 1);
    }
  }

  const clusterKeys: string[] = [];
  const byCluster = new Map<string, ChartPostInput[]>();
  for (const post of posts) {
    const key = rarestCategory(post.categories, freq);
    if (!byCluster.has(key)) {
      byCluster.set(key, []);
      clusterKeys.push(key);
    }
    byCluster.get(key)!.push(post);
  }

  clusterKeys.sort((a, b) => {
    const d = byCluster.get(b)!.length - byCluster.get(a)!.length;
    return d !== 0 ? d : a < b ? -1 : 1;
  });

  const clusters: ChartCluster[] = [];
  const nodes: ChartNode[] = [];

  clusterKeys.forEach((key, clusterIndex) => {
    const members = byCluster.get(key)!;
    const center = clusterCenter(clusterIndex, clusterKeys.length);
    const radius = Math.max(50, 24 + Math.sqrt(members.length) * 34);

    clusters.push({
      key,
      label: key,
      cx: center.x,
      cy: center.y,
      r: radius,
      nodeSlugs: members.map((member) => member.slug),
    });

    members.forEach((post, memberIndex) => {
      const h = hashString(`${key}:${post.slug}`);
      const angle = (h / 0xffffffff) * Math.PI * 2;
      const ring = members.length === 1 ? 0 : 0.25 + ((h >>> 8) % 1000) / 1600;
      const localRadius = radius * ring;
      const jitter = members.length === 1 ? 0 : (memberIndex - (members.length - 1) / 2) * 6;
      const rendering = STATE_RENDERING[post.stage];
      nodes.push({
        slug: post.slug,
        title: post.title,
        stage: post.stage,
        cluster: key,
        x: center.x + Math.cos(angle) * localRadius + jitter,
        y: center.y + Math.sin(angle) * localRadius - jitter / 2,
        r: rendering.r,
        brightness: rendering.brightness,
      });
    });
  });

  const placed = relax(nodes);
  const centerBySlug = new Map(placed.map((node) => [node.slug, node]));
  const edges: ChartEdge[] = [];
  for (const post of posts) {
    const from = centerBySlug.get(post.slug);
    if (!from) continue;
    for (const edge of post.outgoing) {
      const to = centerBySlug.get(edge.to);
      if (!to) continue;
      edges.push({
        from: post.slug,
        to: edge.to,
        kind: edge.kind,
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
      });
    }
  }

  return {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    clusters,
    nodes: placed,
    edges,
  };
}
