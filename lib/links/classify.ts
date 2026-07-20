/**
 * Classify an href for prose-link rendering. Dependency-free and client-safe;
 * it must NOT import lib/content/link-graph.ts (that pulls `unified`
 * into the browser bundle). The post-slug rule mirrors that module's
 * `toInternalSlug`, but is stricter: only `/posts/<slug>` (no further path
 * segment) is a post, so `/posts/topics/<x>` resolves to a plain internal link.
 */

export type LinkClass =
  | { kind: "post"; slug: string }
  | { kind: "internal" }
  | { kind: "external" }
  | { kind: "anchor" }
  | { kind: "other" };

/** A pathname is a post iff it's exactly /posts/<slug> (slug ≠ the topics index). */
function postSlug(pathname: string): string | null {
  const m = pathname.match(/^\/posts\/([^/#?]+)\/?(?:[#?].*)?$/);
  if (!m || m[1] === "topics") return null;
  return m[1];
}

export function classifyHref(
  href: string | undefined,
  siteUrl: string
): LinkClass {
  const h = (href ?? "").trim();
  if (!h) return { kind: "other" };
  if (h.startsWith("#")) return { kind: "anchor" };
  if (h.startsWith("//")) return { kind: "external" };

  // Anything with a URL scheme: http(s) gets host-checked; the rest (mailto:,
  // tel:, ftp:, …) is "other" — not ours to decorate.
  if (/^[a-z][a-z0-9+.-]*:/i.test(h)) {
    if (!/^https?:\/\//i.test(h)) return { kind: "other" };
    try {
      const u = new URL(h);
      if (u.host !== new URL(siteUrl).host) return { kind: "external" };
      const slug = postSlug(u.pathname);
      return slug ? { kind: "post", slug } : { kind: "internal" };
    } catch {
      return { kind: "other" };
    }
  }

  if (h.startsWith("/")) {
    const slug = postSlug(h);
    return slug ? { kind: "post", slug } : { kind: "internal" };
  }

  return { kind: "other" }; // bare relative — uncommon in this corpus
}
