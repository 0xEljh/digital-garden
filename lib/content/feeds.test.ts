import { test, expect, describe } from "bun:test";
import { selectFeedPosts, buildFeeds, buildSitemap } from "./feeds";

const site = {
  url: "https://0xeljh.com",
  title: "Expedition Log",
  description: "desc",
  author: "Elijah",
};

const posts = [
  {
    slug: "mapped",
    title: "Mapped Post",
    excerpt: "e",
    date: "2025-01-01",
    tended: "2025-06-01",
    categories: ["math"],
    stage: "mapped" as const,
  },
  {
    slug: "charted",
    title: "Charted Post",
    excerpt: "b",
    date: "2025-02-01",
    tended: "2025-05-01",
    categories: [],
    stage: "charted" as const,
  },
  {
    slug: "sighted",
    title: "Sighted Post",
    excerpt: "s",
    date: "2025-03-01",
    tended: "2025-04-01",
    categories: [],
    stage: "sighted" as const,
  },
];

describe("selectFeedPosts", () => {
  test("excludes sighted entries (unmapped territory is not broadcast)", () => {
    expect(selectFeedPosts(posts).map((p) => p.slug)).toEqual([
      "mapped",
      "charted",
    ]);
  });
});

describe("buildFeeds", () => {
  const { rss, atom } = buildFeeds(posts, site);
  test("emits rss + atom document roots", () => {
    expect(rss).toContain("<rss");
    expect(atom).toContain("<feed");
  });
  test("includes charted and mapped posts with absolute URLs", () => {
    expect(rss).toContain("https://0xeljh.com/posts/mapped");
    expect(rss).toContain("Mapped Post");
  });
  test("excludes sighted entries from the rendered output", () => {
    expect(rss).not.toContain("Sighted Post");
    expect(rss).not.toContain("/posts/sighted");
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
