import { test, expect, describe } from "bun:test";
import { selectFeedPosts, buildFeeds, buildSitemap } from "./feeds";

const site = {
  url: "https://0xeljh.com",
  title: "Garden",
  description: "desc",
  author: "Elijah",
};

const posts = [
  {
    slug: "ever",
    title: "Evergreen Post",
    excerpt: "e",
    date: "2025-01-01",
    tended: "2025-06-01",
    categories: ["math"],
    stage: "evergreen" as const,
  },
  {
    slug: "bud",
    title: "Budding Post",
    excerpt: "b",
    date: "2025-02-01",
    tended: "2025-05-01",
    categories: [],
    stage: "budding" as const,
  },
  {
    slug: "seed",
    title: "Seedling Post",
    excerpt: "s",
    date: "2025-03-01",
    tended: "2025-04-01",
    categories: [],
    stage: "seedling" as const,
  },
];

describe("selectFeedPosts", () => {
  test("excludes seedlings (drafts are not broadcast)", () => {
    expect(selectFeedPosts(posts).map((p) => p.slug)).toEqual(["ever", "bud"]);
  });
});

describe("buildFeeds", () => {
  const { rss, atom } = buildFeeds(posts, site);
  test("emits rss + atom document roots", () => {
    expect(rss).toContain("<rss");
    expect(atom).toContain("<feed");
  });
  test("includes non-seedling posts with absolute URLs", () => {
    expect(rss).toContain("https://0xeljh.com/posts/ever");
    expect(rss).toContain("Evergreen Post");
  });
  test("excludes seedlings from the rendered output", () => {
    expect(rss).not.toContain("Seedling Post");
    expect(rss).not.toContain("/posts/seed");
  });
});

describe("buildSitemap", () => {
  const xml = buildSitemap(["/", "/posts/ever"], "https://0xeljh.com");
  test("wraps locations in a urlset", () => {
    expect(xml).toContain("<urlset");
    expect(xml).toContain("<loc>https://0xeljh.com/</loc>");
    expect(xml).toContain("<loc>https://0xeljh.com/posts/ever</loc>");
  });
});
