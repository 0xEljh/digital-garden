/**
 * Single source of truth for site-level identity.
 *
 * `head-meta.tsx` previously defaulted the site URL to "" (silently breaking
 * canonical/OG links when NEXT_PUBLIC_SITE_URL was unset); the feed/sitemap
 * generator and JSON-LD also need these values, so they live here once.
 */
export const SITE = {
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://0xeljh.com").replace(
    /\/$/,
    ""
  ),
  title: "Elijah's Expedition Log",
  description:
    "Notes, derivations, and projects — an expedition log, kept in the open.",
  author: "Elijah",
  email: "elijah@0xeljh.com",
} as const;

export const SITE_URL = SITE.url;
