/**
 * Build-time content metadata pipeline.
 *
 * One derivation point for everything the runtime can't cheaply compute:
 *   - last-tended dates from git history
 *   - the internal link graph + inverted backlinks + dead-link detection
 *   - category-casing warnings
 * and it emits the syndication feeds + sitemap.
 *
 * Writes lib/generated/content-meta.json (gitignored) which the loaders merge
 * by slug, plus public/{rss,atom,sitemap}.xml. Run via `bun` so the pure
 * lib/content/* modules are shared verbatim with the unit tests and the app.
 *
 * Malformed YAML frontmatter throws (fails the build, intentionally). Soft
 * issues (no date, non-canonical category, dead link, untracked file) warn but
 * never fail.
 */
import fs from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import matter from "gray-matter";

import { SITE } from "../lib/site";
import {
  isCanonicalCategory,
  labelForCategory,
  slugifyCategory,
} from "../lib/content/categories";
import {
  coerceStage,
  coerceConfidence,
  deriveExcerpt,
  type Stage,
  type Confidence,
} from "../lib/content/schema";
import { resolveTended, type GitExec } from "../lib/content/git-dates";
import { buildGraph } from "../lib/content/link-graph";
import { buildFeeds, buildSitemap, type FeedPost } from "../lib/content/feeds";

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content/posts");
const PORTFOLIO_DIR = path.join(ROOT, "content/portfolio");
const GENERATED = path.join(ROOT, "lib/generated/content-meta.json");
const PUBLIC = path.join(ROOT, "public");

const git: GitExec = async (args) => {
  const { stdout } = await execFileAsync("git", args, {
    cwd: ROOT,
    maxBuffer: 20 * 1024 * 1024,
  });
  return stdout;
};

async function gitHead(): Promise<string> {
  try {
    return (await git(["rev-parse", "HEAD"])).trim();
  } catch {
    return "unknown";
  }
}

async function listMdx(dir: string): Promise<string[]> {
  const files = await fs.readdir(dir);
  return files.filter((f) => f.endsWith(".mdx")).sort();
}

interface ProcessedPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  categories: string[];
  stage: Stage;
  confidence?: Confidence;
  tended: string;
  relatedPosts: string[];
  content: string;
}

async function main(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const warnings: string[] = [];
  const files = await listMdx(POSTS_DIR);
  const posts: ProcessedPost[] = [];

  for (const file of files) {
    const source = await fs.readFile(path.join(POSTS_DIR, file), "utf8");
    const { content, data } = matter(source); // throws on malformed YAML => build fails

    const slug = (data.slug as string) || file.replace(/\.mdx$/, "");
    const title = (data.title as string) || slug;

    const date = (data.date as string) || today;
    if (!data.date) warnings.push(`${file}: no date, defaulted to ${today}`);

    const excerpt = (data.excerpt as string) || deriveExcerpt(content);
    if (!data.excerpt) warnings.push(`${file}: no excerpt, derived from body`);

    const { stage, warning: stageWarning } = coerceStage(data.stage);
    if (stageWarning) warnings.push(`${file}: ${stageWarning}`);

    const { confidence, warning: confWarning } = coerceConfidence(
      data.confidence
    );
    if (confWarning) warnings.push(`${file}: ${confWarning}`);

    const rawCategories: string[] = Array.isArray(data.categories)
      ? data.categories
      : [];
    for (const c of rawCategories) {
      if (!isCanonicalCategory(c)) {
        warnings.push(
          `${file}: non-canonical category "${c}" -> "${labelForCategory(c)}"`
        );
      }
    }
    const categories = rawCategories.map((c) => labelForCategory(c));

    const relatedPosts: string[] = Array.isArray(data.relatedPosts)
      ? data.relatedPosts
      : [];

    const { tended, warning: tendWarning } = await resolveTended({
      filePath: path.join("content/posts", file),
      override: (data.tended as string) ?? null,
      planted: date,
      exec: git,
    });
    if (tendWarning) warnings.push(`${file}: ${tendWarning}`);

    posts.push({
      slug,
      title,
      date,
      excerpt,
      categories,
      stage,
      confidence,
      tended,
      relatedPosts,
      content,
    });
  }

  const graph = buildGraph(
    posts.map((p) => ({
      slug: p.slug,
      content: p.content,
      relatedPosts: p.relatedPosts,
    })),
    { siteUrl: SITE.url }
  );
  for (const dead of graph.deadLinks) {
    warnings.push(`dead link: ${dead.from} -> /posts/${dead.to}`);
  }

  const meta = {
    generatedAt: new Date().toISOString(),
    gitHead: await gitHead(),
    posts: Object.fromEntries(
      posts.map((p) => [
        p.slug,
        {
          tended: p.tended,
          outgoing: graph.outgoing[p.slug] ?? [],
          backlinks: graph.backlinks[p.slug] ?? [],
        },
      ])
    ),
    warnings,
  };
  await fs.mkdir(path.dirname(GENERATED), { recursive: true });
  await fs.writeFile(GENERATED, `${JSON.stringify(meta, null, 2)}\n`);

  const feedPosts: FeedPost[] = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    date: p.date,
    tended: p.tended,
    categories: p.categories,
    stage: p.stage,
  }));
  const { rss, atom } = buildFeeds(feedPosts, SITE);
  await fs.writeFile(path.join(PUBLIC, "rss.xml"), rss);
  await fs.writeFile(path.join(PUBLIC, "atom.xml"), atom);

  const topicSlugs = Array.from(
    new Set(posts.flatMap((p) => p.categories.map((c) => slugifyCategory(c))))
  ).sort();
  const portfolioSlugs = (await listMdx(PORTFOLIO_DIR)).map((f) =>
    f.replace(/\.mdx$/, "")
  );
  const sitemapPaths = [
    "/",
    "/posts",
    "/portfolio",
    "/dashboard",
    "/resume",
    ...posts.map((p) => `/posts/${p.slug}`),
    ...topicSlugs.map((s) => `/posts/topics/${s}`),
    ...portfolioSlugs.map((s) => `/portfolio/${s}`),
  ];
  await fs.writeFile(
    path.join(PUBLIC, "sitemap.xml"),
    buildSitemap(sitemapPaths, SITE.url)
  );

  // Site-level "garden status" for the footer colophon. Pre-format the date here
  // so the client renders a plain string (no Date parsing => no hydration drift).
  const lastTendedIso = posts.reduce(
    (latest, p) => (new Date(p.tended) > new Date(latest) ? p.tended : latest),
    posts[0]?.tended ?? today
  );
  const gardenStatus = {
    generatedAt: meta.generatedAt,
    lastTended: lastTendedIso,
    lastTendedLabel: new Date(lastTendedIso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    postCount: posts.length,
    projectCount: portfolioSlugs.length,
  };
  await fs.writeFile(
    path.join(ROOT, "lib/generated/garden-status.json"),
    `${JSON.stringify(gardenStatus, null, 2)}\n`
  );

  const linkCount = Object.values(graph.outgoing).reduce(
    (n, edges) => n + edges.length,
    0
  );
  console.log(
    `[content-meta] ${posts.length} posts · ${linkCount} links · ${topicSlugs.length} topics · ${graph.deadLinks.length} dead · ${warnings.length} warnings`
  );
  for (const w of warnings) console.warn(`  ⚠ ${w}`);
}

main().catch((err) => {
  console.error("[content-meta] generation failed:", err);
  process.exit(1);
});
