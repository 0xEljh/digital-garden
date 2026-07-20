import { describe, expect, test } from "bun:test";
import {
  buildSearchRecords,
  type PostLike,
  type ProjectLike,
  type RouteLike,
} from "./records";

const post: PostLike = {
  title: "Transformation of the Transformer",
  slug: "transformation-of-the-transformer",
  excerpt: "How attention reshaped sequence modeling.",
  stage: "charted",
  tended: "2026-02-25",
  categories: ["Deep Learning", "Math"],
};

const project: ProjectLike = {
  title: "Eigenform",
  slug: "eigenform",
  shortDescription: "Post-training for geology tasks.",
  categories: ["Deep Learning"],
  date: "2026-01-10",
};

const route: RouteLike = { title: "log", url: "/posts", subtitle: "all entries" };

describe("buildSearchRecords", () => {
  test("maps a post to a post record", () => {
    const [r] = buildSearchRecords([post], [], []);
    expect(r).toMatchObject({
      id: "post:transformation-of-the-transformer",
      type: "post",
      title: "Transformation of the Transformer",
      subtitle: "How attention reshaped sequence modeling.",
      url: "/posts/transformation-of-the-transformer",
      stage: "charted",
      tended: "2026-02-25",
    });
  });

  test("maps a project to a project record (no stage; tended = date)", () => {
    const [r] = buildSearchRecords([], [project], []);
    expect(r).toMatchObject({
      id: "project:eigenform",
      type: "project",
      title: "Eigenform",
      subtitle: "Post-training for geology tasks.",
      url: "/portfolio/eigenform",
      tended: "2026-01-10",
    });
    expect(r.stage).toBeUndefined();
  });

  test("maps a route to a route record", () => {
    const [r] = buildSearchRecords([], [], [route]);
    expect(r).toMatchObject({ id: "route:/posts", type: "route", url: "/posts" });
    expect(r.stage).toBeUndefined();
  });

  test("text haystack is lowercased and includes title, subtitle, and categories", () => {
    const [r] = buildSearchRecords([post], [], []);
    expect(r.text).toContain("transformation of the transformer");
    expect(r.text).toContain("attention");
    expect(r.text).toContain("deep learning");
    expect(r.text).toBe(r.text.toLowerCase());
  });

  test("returns every item across all three kinds, posts → projects → routes", () => {
    const records = buildSearchRecords([post], [project], [route]);
    expect(records).toHaveLength(3);
    expect(records.map((r) => r.type)).toEqual(["post", "project", "route"]);
  });
});
