/**
 * Pure, deterministic layout for the side-view garden field. Turns a post list
 * into plants rooted on a single soil horizon, beds as
 * horizontal ground bands, and edge endpoints — all in abstract viewBox units,
 * no DOM / Date / random — so the whole spatial policy is unit-testable.
 *
 * The scene is a fixed-aspect banner that stretches to the full container width:
 * plants are distributed across bed-bands sized by plant count, every plant
 * rooting on `HORIZON_Y`.
 */
import type { GraphEdge } from "@/lib/content/link-graph";
import type { Stage } from "@/lib/content/schema";

export interface GardenPostInput {
  slug: string;
  title: string;
  stage: Stage;
  categories: string[];
  outgoing: GraphEdge[];
}

export interface PlantPlacement {
  slug: string;
  title: string;
  stage: Stage;
  /** Primary bed key — the post's rarest category, or "wild". */
  bed: string;
  /** Root point: x across the field, y on the soil horizon. */
  x: number;
  y: number;
}

export interface BedRegion {
  key: string;
  label: string;
  /** A ground band: x/w span the soil under this bed's plants, y = horizon. */
  x: number;
  y: number;
  w: number;
  h: number;
  plantSlugs: string[];
}

export interface GardenEdge {
  from: string;
  to: string;
  kind: GraphEdge["kind"];
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface GardenLayout {
  width: number;
  height: number;
  beds: BedRegion[];
  plants: PlantPlacement[];
  edges: GardenEdge[];
}

// Fixed banner in viewBox units. The surface maps width → container width via
// `viewBox` + `width:100%`, so these are relative, not pixels. Wide-not-tall is
// deliberate: a banner reads as a horizon, never an island.
export const FIELD_WIDTH = 1000;
export const FIELD_HEIGHT = 260;
/** The soil line every plant roots on; sky above, soil band below. */
export const HORIZON_Y = 190;
const MARGIN_X = 56;

/** Pick a post's primary bed: its rarest category (tie → authorial order). */
function rarestCategory(
  categories: string[],
  freq: Map<string, number>
): string {
  let best: string | null = null;
  let bestFreq = Infinity;
  for (const c of categories) {
    const f = freq.get(c) ?? 0;
    if (f < bestFreq) {
      best = c;
      bestFreq = f; // strict `<` keeps the first category on a tie
    }
  }
  return best ?? "wild";
}

export function buildGardenLayout(posts: GardenPostInput[]): GardenLayout {
  // 1. category frequencies across the whole corpus
  const freq = new Map<string, number>();
  for (const p of posts) {
    for (const c of p.categories) freq.set(c, (freq.get(c) ?? 0) + 1);
  }

  // 2. group posts into beds by rarest category, preserving corpus order
  const bedKeys: string[] = [];
  const byBed = new Map<string, GardenPostInput[]>();
  for (const p of posts) {
    const key = rarestCategory(p.categories, freq);
    if (!byBed.has(key)) {
      byBed.set(key, []);
      bedKeys.push(key);
    }
    byBed.get(key)!.push(p);
  }

  // larger beds first, then alphabetical — deterministic, roughly balanced
  bedKeys.sort((a, b) => {
    const d = byBed.get(b)!.length - byBed.get(a)!.length;
    return d !== 0 ? d : a < b ? -1 : 1;
  });

  // 3. lay beds left→right as ground bands; band width ∝ plant count, so the
  //    whole field width is filled regardless of post count.
  const total = Math.max(1, posts.length);
  const contentW = FIELD_WIDTH - 2 * MARGIN_X;
  const soilH = FIELD_HEIGHT - HORIZON_Y;

  const beds: BedRegion[] = [];
  const plants: PlantPlacement[] = [];
  const centerBySlug = new Map<string, { x: number; y: number }>();

  let cursorX = MARGIN_X;
  for (const key of bedKeys) {
    const members = byBed.get(key)!;
    const bedW = (contentW * members.length) / total;

    members.forEach((p, i) => {
      // evenly spaced within the band, each rooting on the horizon
      const px = cursorX + (bedW * (i + 0.5)) / members.length;
      const py = HORIZON_Y;
      plants.push({
        slug: p.slug,
        title: p.title,
        stage: p.stage,
        bed: key,
        x: px,
        y: py,
      });
      centerBySlug.set(p.slug, { x: px, y: py });
    });

    beds.push({
      key,
      label: key,
      x: cursorX,
      y: HORIZON_Y,
      w: bedW,
      h: soilH,
      plantSlugs: members.map((p) => p.slug),
    });

    cursorX += bedW;
  }

  // 4. edges between placed posts (dangling targets dropped) — root to root
  const edges: GardenEdge[] = [];
  for (const p of posts) {
    const from = centerBySlug.get(p.slug);
    if (!from) continue;
    for (const e of p.outgoing) {
      const to = centerBySlug.get(e.to);
      if (!to) continue;
      edges.push({
        from: p.slug,
        to: e.to,
        kind: e.kind,
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
      });
    }
  }

  return {
    width: FIELD_WIDTH,
    height: FIELD_HEIGHT,
    beds,
    plants,
    edges,
  };
}
