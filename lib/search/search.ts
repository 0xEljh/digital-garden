import { score } from "./score";
import type { RankedRecord, SearchRecord } from "./types";

/** A title hit is worth more than the same hit buried in the body. */
const TITLE_WEIGHT = 2;

/** Combined field score: title weighted over body; `-1` only when neither field matches. */
function combinedScore(query: string, record: SearchRecord): number {
  const title = score(query, record.title);
  const body = score(query, record.text);
  if (title < 0 && body < 0) return -1;
  return Math.max(title, 0) * TITLE_WEIGHT + Math.max(body, 0);
}

/**
 * Rank records against a query. An empty query returns the first `limit` records in their original
 * (index) order — the palette's resting list. Otherwise: score each record, drop non-matches
 * (score < 0), sort by descending score, and return the top `limit`. A title match outranks a
 * body-only match for the same query.
 *
 * Phase 1 = search mode only. The `/` command grammar (parseInput + registry) lands in Phase 2.
 */
export function search(
  records: SearchRecord[],
  query: string,
  limit = 8,
): RankedRecord[] {
  const q = query.trim();
  const ranked: RankedRecord[] = [];
  for (const record of records) {
    const s = q.length === 0 ? 0 : combinedScore(q, record);
    if (s < 0) continue;
    ranked.push({ record, score: s });
  }
  // Stable sort (bun/JSC): higher score first; equal scores keep original index order.
  ranked.sort((a, b) => b.score - a.score);
  return ranked.slice(0, limit);
}
