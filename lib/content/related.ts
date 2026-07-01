/**
 * Graph-derived "Related / Nearby" ranking — the policy half of C6. The
 * generator emits raw graph facts (outgoing edges); this pure function decides
 * what's *near* a post by unioning those edges with shared-category proximity,
 * so a neighbor reachable only through a shared topic still surfaces. Kept out
 * of the build script so the weighting can be tuned and unit-tested in isolation.
 */
import type { GraphEdge } from "./link-graph";
import type { Stage } from "./schema";

export interface RelatedTarget {
  slug: string;
  categories: string[];
  /** manual relatedPosts + inline mentions, merged by the link graph */
  outgoing: GraphEdge[];
}

export interface RelatedCandidate {
  slug: string;
  title: string;
  categories: string[];
  date: string;
  stage: Stage;
}

export type RelatedReason = "related" | "linked" | "shared";

export interface RelatedPick {
  slug: string;
  title: string;
  stage: Stage;
  reason: RelatedReason;
  /** Set only when the dominant signal is a shared category. */
  sharedCategory?: string;
  score: number;
}

const WEIGHT = { related: 3, inline: 2, category: 1 } as const;

/** Shared categories in the target's order, so the first is deterministic. */
function sharedCategories(a: string[], b: string[]): string[] {
  const set = new Set(b);
  return a.filter((c) => set.has(c));
}

export function deriveRelated(
  target: RelatedTarget,
  candidates: RelatedCandidate[],
  limit = 3
): RelatedPick[] {
  const edgeKind = new Map(target.outgoing.map((e) => [e.to, e.kind]));

  const picks: RelatedPick[] = [];
  for (const c of candidates) {
    if (c.slug === target.slug) continue; // never relate to self

    const kind = edgeKind.get(c.slug);
    const shared = sharedCategories(target.categories, c.categories);

    let score = shared.length * WEIGHT.category;
    let reason: RelatedReason;
    let sharedCategory: string | undefined;

    if (kind === "related") {
      score += WEIGHT.related;
      reason = "related";
    } else if (kind === "inline") {
      score += WEIGHT.inline;
      reason = "linked";
    } else if (shared.length > 0) {
      reason = "shared";
      sharedCategory = shared[0];
    } else {
      continue; // no edge, no shared topic — not a neighbor
    }

    picks.push({
      slug: c.slug,
      title: c.title,
      stage: c.stage,
      reason,
      sharedCategory,
      score,
    });
  }

  // Highest score first; ties broken by recency, then slug — fully deterministic.
  const byDate = new Map(candidates.map((c) => [c.slug, c.date]));
  picks.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const da = byDate.get(a.slug) ?? "";
    const db = byDate.get(b.slug) ?? "";
    if (db !== da) return db < da ? -1 : 1; // newer date first
    return a.slug < b.slug ? -1 : 1;
  });

  return picks.slice(0, limit);
}
