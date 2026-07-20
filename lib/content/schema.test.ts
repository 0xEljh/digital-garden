import { test, expect, describe } from "bun:test";
import {
  coerceStage,
  coerceConfidence,
  deriveExcerpt,
  glyphForStage,
  DEFAULT_STAGE,
  STAGES,
} from "./schema";

describe("coerceStage", () => {
  test("passes through valid stages", () => {
    expect(coerceStage("charted")).toEqual({ stage: "charted" });
    expect(coerceStage("mapped").stage).toBe("mapped");
  });
  test("defaults to sighted when absent (the low-friction default)", () => {
    expect(coerceStage(undefined)).toEqual({ stage: "sighted" });
    expect(DEFAULT_STAGE).toBe("sighted");
  });
  test("warns and defaults on an unknown value", () => {
    const r = coerceStage("sprout");
    expect(r.stage).toBe("sighted");
    expect(r.warning).toMatch(/unknown stage/i);
  });
});

describe("coerceConfidence", () => {
  test("passes through a valid confidence", () => {
    expect(coerceConfidence("likely")).toEqual({ confidence: "likely" });
  });
  test("empty object when absent (confidence is optional)", () => {
    expect(coerceConfidence(undefined)).toEqual({});
  });
  test("warns and ignores an unknown value", () => {
    const r = coerceConfidence("maybe");
    expect(r.confidence).toBeUndefined();
    expect(r.warning).toMatch(/unknown confidence/i);
  });
});

describe("glyphForStage", () => {
  test("maps each stage to its escalating sprite", () => {
    expect(glyphForStage("sighted")).toBe("✦");
    expect(glyphForStage("charted")).toBe("✳");
    expect(glyphForStage("mapped")).toBe("❋");
  });
  test("every stage has a glyph (guards the shared map)", () => {
    for (const s of STAGES) expect(glyphForStage(s).length).toBeGreaterThan(0);
  });
});

describe("deriveExcerpt", () => {
  test("takes the first N words from prose", () => {
    expect(deriveExcerpt("This is the opening line of the note.", 4)).toBe(
      "This is the opening…"
    );
  });
  test("skips fenced code blocks", () => {
    const md = "```js\nconst x = 1;\n```\n\nReal prose begins here.";
    expect(deriveExcerpt(md, 4)).toBe("Real prose begins here.");
  });
  test("skips headings and unwraps link text", () => {
    const md = "# Title\n\nSee [the docs](/posts/x) now.";
    expect(deriveExcerpt(md, 5)).toBe("See the docs now.");
  });
  test("no ellipsis when shorter than the limit", () => {
    expect(deriveExcerpt("Short note.", 30)).toBe("Short note.");
  });
});
