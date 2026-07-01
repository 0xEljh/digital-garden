import { describe, expect, test } from "bun:test";
import { classifyHref } from "./classify";

const SITE = "https://0xeljh.com";

describe("classifyHref", () => {
  test("root-relative /posts/<slug> is a post", () => {
    expect(classifyHref("/posts/attention", SITE)).toEqual({
      kind: "post",
      slug: "attention",
    });
  });

  test("strips hash and query from a post slug", () => {
    expect(classifyHref("/posts/attention#section", SITE)).toEqual({
      kind: "post",
      slug: "attention",
    });
    expect(classifyHref("/posts/attention?utm=x", SITE)).toEqual({
      kind: "post",
      slug: "attention",
    });
  });

  test("same-host absolute /posts/<slug> is a post", () => {
    expect(classifyHref("https://0xeljh.com/posts/attention", SITE)).toEqual({
      kind: "post",
      slug: "attention",
    });
  });

  test("a different host is external", () => {
    expect(classifyHref("https://arxiv.org/abs/1706.03762", SITE)).toEqual({
      kind: "external",
    });
  });

  test("protocol-relative is external", () => {
    expect(classifyHref("//example.com/x", SITE)).toEqual({ kind: "external" });
  });

  test("same-site non-post is internal, not a post", () => {
    expect(classifyHref("/portfolio/foo", SITE)).toEqual({ kind: "internal" });
    expect(classifyHref("/", SITE)).toEqual({ kind: "internal" });
    // topics index lives under /posts/ but is not a post
    expect(classifyHref("/posts/topics/math", SITE)).toEqual({
      kind: "internal",
    });
    expect(classifyHref("/posts/topics", SITE)).toEqual({ kind: "internal" });
  });

  test("a bare hash is an anchor", () => {
    expect(classifyHref("#derivation", SITE)).toEqual({ kind: "anchor" });
  });

  test("mailto and tel are other", () => {
    expect(classifyHref("mailto:elijah@example.com", SITE)).toEqual({
      kind: "other",
    });
    expect(classifyHref("tel:+6512345678", SITE)).toEqual({ kind: "other" });
  });

  test("empty or undefined is other", () => {
    expect(classifyHref("", SITE)).toEqual({ kind: "other" });
    expect(classifyHref(undefined, SITE)).toEqual({ kind: "other" });
  });
});
