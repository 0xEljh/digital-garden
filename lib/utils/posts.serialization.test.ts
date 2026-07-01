import { test, expect, describe } from "bun:test";
import { loadPosts, loadPostsMetadata } from "./posts";

/**
 * Regression guard for "undefined cannot be serialized as JSON" from
 * getStaticProps. Next rejects ANY undefined value in returned props, so post
 * metadata must omit optional fields (confidence, mathTooltips) when absent
 * rather than set them to undefined. Runs against the real corpus.
 */
function undefinedKeys(obj: Record<string, unknown>): string[] {
  return Object.entries(obj)
    .filter(([, v]) => v === undefined)
    .map(([k]) => k);
}

describe("getStaticProps serialization safety", () => {
  test("loadPostsMetadata yields no undefined values", async () => {
    const posts = await loadPostsMetadata();
    expect(posts.length).toBeGreaterThan(0);
    for (const p of posts) {
      expect(undefinedKeys(p as unknown as Record<string, unknown>)).toEqual([]);
    }
  });

  test("loadPosts yields no undefined metadata values", async () => {
    const posts = await loadPosts();
    for (const p of posts) {
      const { content, ...meta } = p;
      expect(content).toBeDefined();
      expect(undefinedKeys(meta as Record<string, unknown>)).toEqual([]);
    }
  });
});
