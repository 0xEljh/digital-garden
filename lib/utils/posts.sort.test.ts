import { test, expect, describe } from "bun:test";
import { loadPostsMetadata, sortByTendedDesc } from "./posts";

/**
 * Activity surfaces (home recent log, /posts list) order by `tended`, not
 * `date` — a living topic note appended to weekly must surface at the top
 * instead of sinking by its original logged date (docs/design/
 * paper-log-pipeline.md D7). Feeds/sitemap have their own date-ordered path
 * in scripts/generate-content-meta.ts and are unaffected.
 */
const entry = (slug: string, date: string, tended: string) => ({
  slug,
  date,
  tended,
});

describe("sortByTendedDesc (activity order)", () => {
  test("orders by tended descending, not by date", () => {
    const old = entry("old-but-tended", "2026-03-01", "2026-07-01");
    const fresh = entry("fresh-untouched", "2026-06-20", "2026-06-20");
    expect(sortByTendedDesc([fresh, old]).map((p) => p.slug)).toEqual([
      "old-but-tended",
      "fresh-untouched",
    ]);
  });

  test("ties on tended break by date descending", () => {
    const a = entry("logged-earlier", "2026-05-01", "2026-07-01");
    const b = entry("logged-later", "2026-06-01", "2026-07-01");
    expect(sortByTendedDesc([a, b]).map((p) => p.slug)).toEqual([
      "logged-later",
      "logged-earlier",
    ]);
  });

  test("never-committed drafts (tended falls back to date) interleave", () => {
    const draft = entry("draft", "2026-07-03", "2026-07-03");
    const tended = entry("tended-note", "2026-01-01", "2026-07-04");
    const stale = entry("stale", "2026-06-01", "2026-06-01");
    expect(sortByTendedDesc([stale, draft, tended]).map((p) => p.slug)).toEqual([
      "tended-note",
      "draft",
      "stale",
    ]);
  });
});

describe("loader activity order (real corpus)", () => {
  test("loadPostsMetadata returns non-increasing tended", async () => {
    const posts = await loadPostsMetadata();
    expect(posts.length).toBeGreaterThan(0);
    for (let i = 1; i < posts.length; i++) {
      expect(
        new Date(posts[i - 1].tended).getTime()
      ).toBeGreaterThanOrEqual(new Date(posts[i].tended).getTime());
    }
  });
});
