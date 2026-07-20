import { test, expect, describe } from "bun:test";
import { resolveTended } from "./git-dates";

const planted = "2025-05-13";

describe("resolveTended", () => {
  test("uses a valid frontmatter override without touching git", async () => {
    let called = false;
    const exec = async () => {
      called = true;
      return "";
    };
    const r = await resolveTended({
      filePath: "p.mdx",
      override: "2026-06-01",
      planted,
      exec,
    });
    expect(r).toEqual({ tended: "2026-06-01", source: "frontmatter" });
    expect(called).toBe(false);
  });

  test("uses the git commit date when available", async () => {
    const exec = async () => "2026-02-25T20:13:37Z\n";
    const r = await resolveTended({ filePath: "p.mdx", planted, exec });
    expect(r.source).toBe("git");
    expect(r.tended).toBe("2026-02-25T20:13:37Z");
  });

  test("falls back to planted on empty git output (untracked file)", async () => {
    const exec = async () => "\n";
    const r = await resolveTended({ filePath: "p.mdx", planted, exec });
    expect(r.source).toBe("fallback");
    expect(r.tended).toBe(planted);
    expect(r.warning).toBeDefined();
  });

  test("falls back to planted when git throws (no .git / not installed)", async () => {
    const exec = async () => {
      throw new Error("git not found");
    };
    const r = await resolveTended({ filePath: "p.mdx", planted, exec });
    expect(r.source).toBe("fallback");
    expect(r.warning).toMatch(/git/i);
  });

  test("falls back and warns on an invalid override", async () => {
    const exec = async () => "2026-02-25T20:13:37Z";
    const r = await resolveTended({
      filePath: "p.mdx",
      override: "not-a-date",
      planted,
      exec,
    });
    expect(r.source).toBe("fallback");
    expect(r.warning).toMatch(/override/i);
  });
});
