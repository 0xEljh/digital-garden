/**
 * Category normalization. One function decides the canonical (slug, label) for
 * any raw category string, so topic-page routes, tag rendering, and the
 * build-time "non-canonical category" warning all agree.
 *
 * Default register is all-lowercase (matching the terminal aesthetic). Proper
 * nouns that should keep specific casing go in CATEGORY_LABEL_EXCEPTIONS — keyed
 * by slug so the exception applies regardless of how the source wrote it.
 */

export const CATEGORY_LABEL_EXCEPTIONS: Record<string, string> = {
  // e.g. pytorch: "PyTorch" — intentionally empty; populate to taste.
};

export interface NormalizedCategory {
  slug: string;
  label: string;
}

/** URL-safe slug: lowercase, non-alphanumerics collapsed to single hyphens. */
export function slugifyCategory(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Canonical display label: an exception if one exists, else the de-slugged words. */
export function labelForCategory(
  raw: string,
  exceptions: Record<string, string> = CATEGORY_LABEL_EXCEPTIONS
): string {
  const slug = slugifyCategory(raw);
  return exceptions[slug] ?? slug.replace(/-/g, " ");
}

export function normalizeCategory(
  raw: string,
  exceptions?: Record<string, string>
): NormalizedCategory {
  return {
    slug: slugifyCategory(raw),
    label: labelForCategory(raw, exceptions),
  };
}

/** True when the source already matches canon (no cleanup needed). */
export function isCanonicalCategory(
  raw: string,
  exceptions?: Record<string, string>
): boolean {
  return raw === labelForCategory(raw, exceptions);
}
