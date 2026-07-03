import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "fs";
import path from "path";
import matter from "gray-matter";
import { coerceStage } from "../content/schema";
import {
  buildSearchRecords,
  type PostLike,
  type ProjectLike,
  type RouteLike,
} from "./records";

// Integration: exercise the real mapper against the real content corpus (no git, no
// generated artifact required) so index coverage can't silently drift from the files.

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content/posts");
const PORTFOLIO_DIR = path.join(ROOT, "content/portfolio");

const mdx = (dir: string) => readdirSync(dir).filter((f) => f.endsWith(".mdx"));
const read = (dir: string, file: string) =>
  matter(readFileSync(path.join(dir, file), "utf8"));

const postSlugs = mdx(POSTS_DIR).map(
  (f) => (read(POSTS_DIR, f).data.slug as string) || f.replace(/\.mdx$/, ""),
);
const projectSlugs = mdx(PORTFOLIO_DIR).map((f) => f.replace(/\.mdx$/, ""));

const posts: PostLike[] = mdx(POSTS_DIR).map((f) => {
  const { content, data } = read(POSTS_DIR, f);
  return {
    title: (data.title as string) || f,
    slug: (data.slug as string) || f.replace(/\.mdx$/, ""),
    excerpt: (data.excerpt as string) || content.slice(0, 60),
    stage: coerceStage(data.stage).stage,
    tended: (data.tended as string) || (data.date as string) || "",
    categories: Array.isArray(data.categories) ? (data.categories as string[]) : [],
  };
});

const projects: ProjectLike[] = mdx(PORTFOLIO_DIR).map((f) => {
  const { data } = read(PORTFOLIO_DIR, f);
  return {
    title: (data.title as string) || f,
    slug: f.replace(/\.mdx$/, ""),
    shortDescription: (data.shortDescription as string) || "",
    categories: (Array.isArray(data.categories)
      ? data.categories
      : []) as ProjectLike["categories"],
    date: (data.date as string) || "",
  };
});

const routes: RouteLike[] = [
  { title: "home", url: "/" },
  { title: "log", url: "/posts" },
];

const records = buildSearchRecords(posts, projects, routes);

describe("search index over real content", () => {
  test("indexes every post at /posts/<slug>", () => {
    expect(postSlugs.length).toBeGreaterThan(0);
    for (const slug of postSlugs) {
      const record = records.find((r) => r.id === `post:${slug}`);
      expect(record).toBeDefined();
      expect(record?.url).toBe(`/posts/${slug}`);
    }
  });

  test("indexes every portfolio project at /portfolio/<slug>", () => {
    expect(projectSlugs.length).toBeGreaterThan(0);
    for (const slug of projectSlugs) {
      const record = records.find((r) => r.id === `project:${slug}`);
      expect(record).toBeDefined();
      expect(record?.url).toBe(`/portfolio/${slug}`);
    }
  });

  test("every record has a title and a root-relative, lowercased haystack", () => {
    expect(records.length).toBe(postSlugs.length + projectSlugs.length + routes.length);
    for (const r of records) {
      expect(r.title.length).toBeGreaterThan(0);
      expect(r.url.startsWith("/")).toBe(true);
      expect(r.text).toBe(r.text.toLowerCase());
    }
  });
});
