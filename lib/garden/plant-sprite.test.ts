import { describe, expect, test } from "bun:test";
import { getPlantSprite, pickVariant } from "./plant-sprite";
import { STAGES, STAGE_GLYPH } from "@/lib/content/schema";

describe("getPlantSprite", () => {
  test("returns non-empty string lines for every stage", () => {
    for (const stage of STAGES) {
      const lines = getPlantSprite(stage);
      expect(lines.length).toBeGreaterThan(0);
      expect(lines.every((l) => typeof l === "string")).toBe(true);
    }
  });

  test("the crown carries the stage glyph", () => {
    for (const stage of STAGES) {
      expect(getPlantSprite(stage).join("\n")).toContain(STAGE_GLYPH[stage]);
    }
  });

  test("maturity reads as height: seedling < budding < evergreen", () => {
    const h = (s: (typeof STAGES)[number]) => getPlantSprite(s).length;
    expect(h("seedling")).toBeLessThan(h("budding"));
    expect(h("budding")).toBeLessThan(h("evergreen"));
  });

  test("the stem roots the plant (last line is a trunk)", () => {
    for (const stage of STAGES) {
      const lines = getPlantSprite(stage);
      const last = lines[lines.length - 1];
      // trunk renders in the rich plant font: block █ or box │
      expect(last.includes("█") || last.includes("│")).toBe(true);
    }
  });

  test("foliage gains block mass with maturity, not just a swapped crown", () => {
    // seedling stays a sparse sprout; budding & evergreen grow a block canopy.
    expect(getPlantSprite("budding").join("")).toContain("█");
    expect(getPlantSprite("evergreen").join("")).toContain("█");
    // evergreen layers more tiers than budding (taller silhouette)
    expect(getPlantSprite("evergreen").length).toBeGreaterThan(
      getPlantSprite("budding").length
    );
  });

  test("offers two distinct silhouettes per stage (variety)", () => {
    for (const stage of STAGES) {
      const a = getPlantSprite(stage, 0).join("\n");
      const b = getPlantSprite(stage, 1).join("\n");
      expect(a).not.toBe(b);
      // both variants keep the stage's height, so maturity stays legible
      expect(getPlantSprite(stage, 1).length).toBe(
        getPlantSprite(stage, 0).length
      );
    }
  });

  test("pickVariant is deterministic and binary", () => {
    for (const slug of ["intro-gpu", "time", "classic-sgd", "cross-entropy"]) {
      const v = pickVariant(slug);
      expect(v === 0 || v === 1).toBe(true);
      expect(pickVariant(slug)).toBe(v);
    }
  });

  test("deterministic", () => {
    expect(getPlantSprite("budding")).toEqual(getPlantSprite("budding"));
  });
});
