import { test, expect, describe } from "bun:test";
import { extractInternalSlugs, buildGraph } from "./link-graph";

const site = { siteUrl: "https://0xeljh.com" };

describe("extractInternalSlugs", () => {
  test("collects /posts/ links and ignores external ones", () => {
    const md = "See [a](/posts/foo) and [ext](https://google.com/x).";
    expect(extractInternalSlugs(md, site)).toEqual(["foo"]);
  });
  test("ignores links inside fenced code blocks", () => {
    const md = "```\n[x](/posts/ghost)\n```\n\ntext";
    expect(extractInternalSlugs(md, site)).toEqual([]);
  });
  test("resolves absolute same-host URLs to a slug (stripping hash)", () => {
    const md = "[a](https://0xeljh.com/posts/bar#section)";
    expect(extractInternalSlugs(md, site)).toEqual(["bar"]);
  });
  test("rejects absolute URLs on other hosts", () => {
    const md = "[a](https://evil.com/posts/bar)";
    expect(extractInternalSlugs(md, site)).toEqual([]);
  });
  test("collects reference-style link definitions", () => {
    const md = "[a][ref]\n\n[ref]: /posts/refd";
    expect(extractInternalSlugs(md, site)).toEqual(["refd"]);
  });
  test("dedupes repeated targets", () => {
    const md = "[a](/posts/foo) and again [b](/posts/foo)";
    expect(extractInternalSlugs(md, site)).toEqual(["foo"]);
  });
});

describe("buildGraph", () => {
  const posts = [
    { slug: "a", content: "links to [b](/posts/b)", relatedPosts: [] },
    { slug: "b", content: "no links", relatedPosts: ["a"] },
    {
      slug: "c",
      content: "ghost [g](/posts/ghost) and self [s](/posts/c)",
      relatedPosts: [],
    },
  ];
  const g = buildGraph(posts, site);

  test("records inline edges from markdown links", () => {
    expect(g.outgoing.a).toEqual([{ to: "b", kind: "inline" }]);
  });
  test("records related edges from frontmatter", () => {
    expect(g.outgoing.b).toEqual([{ to: "a", kind: "related" }]);
  });
  test("inverts both edge kinds into backlinks", () => {
    expect(g.backlinks.b).toEqual(["a"]);
    expect(g.backlinks.a).toEqual(["b"]);
  });
  test("records dead links to unknown slugs", () => {
    expect(g.deadLinks).toContainEqual({ from: "c", to: "ghost" });
  });
  test("drops self links", () => {
    expect(g.outgoing.c).toEqual([]);
  });
  test("inline takes precedence over related for the same target", () => {
    const p = [
      { slug: "x", content: "[y](/posts/y)", relatedPosts: ["y"] },
      { slug: "y", content: "", relatedPosts: [] },
    ];
    expect(buildGraph(p, site).outgoing.x).toEqual([{ to: "y", kind: "inline" }]);
  });
});
