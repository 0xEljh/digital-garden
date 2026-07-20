import type { Stage } from "../content/schema";

/** The kinds of things the palette can surface. */
export type SearchKind = "post" | "project" | "route";

/**
 * One indexable item. `text` is a precomputed, lowercased haystack (title + subtitle +
 * categories) so matching never re-derives it per keystroke.
 */
export interface SearchRecord {
  id: string; // `${type}:${slug | path}` — stable, unique
  type: SearchKind;
  title: string;
  subtitle?: string;
  url: string;
  stage?: Stage; // posts only
  tended?: string; // ISO 8601; posts: tended date, projects: shipped date
  categories?: string[];
  text: string; // lowercased match haystack
}

/** A record paired with its fuzzy score for the current query (higher = better). */
export interface RankedRecord {
  record: SearchRecord;
  score: number;
}
