/**
 * Build-time search index for the command palette.
 *
 * Flattens posts + portfolio projects + top-level routes into one pre-lowercased
 * record array (lib/search/records.ts) and writes lib/generated/search-index.json
 * (gitignored). Run via `bun` AFTER generate-content-meta so per-post `tended`
 * dates are available; falls back to the logged date when the meta is absent.
 *
 * Self-contained and relative-import only, matching generate-content-meta.ts —
 * the loaders pull in next-mdx-remote/serialize, which has no business in a
 * build script.
 */
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

import { coerceStage, deriveExcerpt } from "../lib/content/schema";
import { labelForCategory } from "../lib/content/categories";
import {
  buildSearchRecords,
  type PostLike,
  type ProjectLike,
  type RouteLike,
} from "../lib/search/records";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content/posts");
const PORTFOLIO_DIR = path.join(ROOT, "content/portfolio");
const CONTENT_META = path.join(ROOT, "lib/generated/content-meta.json");
const OUT = path.join(ROOT, "lib/generated/search-index.json");

/** Top-level destinations offered as `goto` targets, in nav order. */
const ROUTES: RouteLike[] = [
  { title: "home", url: "/", subtitle: "operator screen" },
  { title: "log", url: "/posts", subtitle: "all entries" },
  { title: "portfolio", url: "/portfolio", subtitle: "projects & work" },
  { title: "stats", url: "/dashboard", subtitle: "time-accounting" },
  { title: "resume", url: "/resume", subtitle: "cv" },
];

async function listMdx(dir: string): Promise<string[]> {
  const files = await fs.readdir(dir);
  return files.filter((f) => f.endsWith(".mdx")).sort();
}

/** Per-slug last-tended dates from the content-meta pipeline (empty if not yet built). */
async function loadTended(): Promise<Record<string, string>> {
  try {
    const meta = JSON.parse(await fs.readFile(CONTENT_META, "utf8")) as {
      posts?: Record<string, { tended?: string }>;
    };
    const out: Record<string, string> = {};
    for (const [slug, entry] of Object.entries(meta.posts ?? {})) {
      if (entry.tended) out[slug] = entry.tended;
    }
    return out;
  } catch {
    return {};
  }
}

async function main(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const tendedBySlug = await loadTended();

  const posts: PostLike[] = [];
  for (const file of await listMdx(POSTS_DIR)) {
    const { content, data } = matter(
      await fs.readFile(path.join(POSTS_DIR, file), "utf8"),
    );
    const slug = (data.slug as string) || file.replace(/\.mdx$/, "");
    const categories = (
      Array.isArray(data.categories) ? (data.categories as string[]) : []
    ).map((c) => labelForCategory(c));
    posts.push({
      title: (data.title as string) || slug,
      slug,
      excerpt: (data.excerpt as string) || deriveExcerpt(content),
      stage: coerceStage(data.stage).stage,
      tended: tendedBySlug[slug] ?? (data.date as string) ?? today,
      categories,
    });
  }

  const projects: ProjectLike[] = [];
  for (const file of await listMdx(PORTFOLIO_DIR)) {
    const { data } = matter(
      await fs.readFile(path.join(PORTFOLIO_DIR, file), "utf8"),
    );
    projects.push({
      title: (data.title as string) || file.replace(/\.mdx$/, ""),
      slug: file.replace(/\.mdx$/, ""),
      shortDescription: (data.shortDescription as string) || "",
      categories: (Array.isArray(data.categories)
        ? data.categories
        : []) as ProjectLike["categories"],
      date: (data.date as string) || today,
    });
  }

  const records = buildSearchRecords(posts, projects, ROUTES);
  const out = {
    generatedAt: new Date().toISOString(),
    count: records.length,
    records,
  };
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, `${JSON.stringify(out, null, 2)}\n`);

  console.log(
    `[search-index] ${records.length} records · ${posts.length} posts · ${projects.length} projects · ${ROUTES.length} routes`,
  );
}

main().catch((err) => {
  console.error("[search-index] generation failed:", err);
  process.exit(1);
});
