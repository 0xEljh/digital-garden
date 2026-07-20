/**
 * RSS / Atom / sitemap builders. Pure functions over plain data so they are
 * unit-testable; the generate script feeds them real posts and writes the
 * output to public/.
 *
 * Sighted entries are excluded from the syndication feeds (logging a rough
 * detection is free, but it is not broadcast until charted) — they remain in
 * the sitemap, which lists every public route.
 */
import { Feed } from "feed";
import type { Stage } from "./schema";

export interface FeedPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tended: string;
  categories: string[];
  stage: Stage;
}

export interface SiteInfo {
  url: string;
  title: string;
  description: string;
  author: string;
  email?: string;
}

/** Posts eligible for syndication: everything past the sighted state. */
export function selectFeedPosts(posts: FeedPost[]): FeedPost[] {
  return posts.filter((p) => p.stage !== "sighted");
}

export function buildFeeds(
  posts: FeedPost[],
  site: SiteInfo
): { rss: string; atom: string; json: string } {
  const feed = new Feed({
    title: site.title,
    description: site.description,
    id: site.url,
    link: site.url,
    language: "en",
    copyright: `© ${site.author}`,
    feedLinks: { rss: `${site.url}/rss.xml`, atom: `${site.url}/atom.xml` },
    author: { name: site.author, link: site.url, email: site.email },
  });

  for (const post of selectFeedPosts(posts)) {
    const url = `${site.url}/posts/${post.slug}`;
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.excerpt,
      date: new Date(post.tended || post.date),
      category: post.categories.map((name) => ({ name })),
    });
  }

  return { rss: feed.rss2(), atom: feed.atom1(), json: feed.json1() };
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildSitemap(paths: string[], siteUrl: string): string {
  const urls = paths.map((p) => {
    const loc = `${siteUrl}${p.startsWith("/") ? p : `/${p}`}`;
    return `  <url><loc>${escapeXml(loc)}</loc></url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}
