/**
 * Build-time internal link graph.
 *
 * We parse each post as CommonMark (remark-parse + gfm) and collect `link` /
 * `definition` node URLs. Parsing — not regex — so links inside fenced code
 * blocks are ignored for free (the corpus is full of code). MDX/JSX is treated
 * as raw HTML by the CommonMark parser, so it never throws; the known tradeoff
 * is that markdown links nested *inside* JSX component children are not seen.
 */
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";

const parser = unified().use(remarkParse).use(remarkGfm);

/** Map a link URL to an internal post slug, or null if it isn't one. */
function toInternalSlug(url: string, siteUrl: string): string | null {
  let u = url.trim();
  if (!u) return null;

  if (/^https?:\/\//i.test(u)) {
    try {
      const parsed = new URL(u);
      const siteHost = new URL(siteUrl).host;
      if (parsed.host !== siteHost) return null; // external
      u = parsed.pathname;
    } catch {
      return null;
    }
  }

  const match = u.match(/^\/posts\/([^/#?]+)/);
  return match ? match[1] : null;
}

export function extractInternalSlugs(
  mdx: string,
  opts: { siteUrl: string }
): string[] {
  const tree = parser.parse(mdx);
  const urls: string[] = [];
  visit(tree, (node: { type: string; url?: string }) => {
    if (
      (node.type === "link" || node.type === "definition") &&
      typeof node.url === "string"
    ) {
      urls.push(node.url);
    }
  });

  const slugs = urls
    .map((u) => toInternalSlug(u, opts.siteUrl))
    .filter((s): s is string => s != null);

  return Array.from(new Set(slugs));
}

export type EdgeKind = "inline" | "related";

export interface GraphEdge {
  to: string;
  kind: EdgeKind;
}

export interface DeadLink {
  from: string;
  to: string;
}

export interface LinkGraph {
  outgoing: Record<string, GraphEdge[]>;
  backlinks: Record<string, string[]>;
  deadLinks: DeadLink[];
}

export interface GraphInput {
  slug: string;
  content: string;
  relatedPosts?: string[];
}

export function buildGraph(
  posts: GraphInput[],
  opts: { siteUrl: string }
): LinkGraph {
  const known = new Set(posts.map((p) => p.slug));
  const outgoing: Record<string, GraphEdge[]> = {};
  const deadLinks: DeadLink[] = [];

  for (const post of posts) {
    const edges = new Map<string, EdgeKind>();

    for (const to of extractInternalSlugs(post.content, opts)) {
      if (to === post.slug) continue; // drop self links
      if (!known.has(to)) {
        deadLinks.push({ from: post.slug, to });
        continue;
      }
      edges.set(to, "inline");
    }

    for (const to of post.relatedPosts ?? []) {
      if (to === post.slug) continue;
      if (!known.has(to)) {
        deadLinks.push({ from: post.slug, to });
        continue;
      }
      if (!edges.has(to)) edges.set(to, "related"); // inline wins
    }

    outgoing[post.slug] = Array.from(edges, ([to, kind]) => ({ to, kind }));
  }

  const backlinks: Record<string, string[]> = {};
  for (const slug of known) backlinks[slug] = [];
  for (const [from, edges] of Object.entries(outgoing)) {
    for (const edge of edges) {
      if (!backlinks[edge.to].includes(from)) backlinks[edge.to].push(from);
    }
  }

  return { outgoing, backlinks, deadLinks };
}
