import { describe, expect, test } from "bun:test";
import {
  buildHighlightFromCells,
  createAutoHighlightMask,
  encodeHighlightSegments,
  normalizeHighlightColor,
} from "./generate-ascii-assets.mjs";

type TestCell = {
  char: string;
  r: number;
  g: number;
  b: number;
  brightness: number;
  chroma: number;
};

const cell = (char: string, r: number, g: number, b: number): TestCell => ({
  char,
  r,
  g,
  b,
  brightness: 0.299 * r + 0.587 * g + 0.114 * b,
  chroma: Math.max(r, g, b) - Math.min(r, g, b),
});

const hexToRgb = (hex: string) => {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) throw new Error(`Invalid hex color: ${hex}`);

  const value = Number.parseInt(match[1], 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const rgbToHsl = ({ r, g, b }: { r: number; g: number; b: number }) => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const lightness = (max + min) / 2;

  if (max === min) return { saturation: 0, lightness };

  const delta = max - min;
  const saturation = lightness > 0.5
    ? delta / (2 - max - min)
    : delta / (max + min);

  return { saturation, lightness };
};

describe("ASCII highlight generation", () => {
  test("auto mask applies chroma threshold only to non-space cells", () => {
    const rows = [" A"];
    const cells = [[
      cell(" ", 240, 20, 20),
      cell("A", 240, 20, 20),
    ]];

    expect(createAutoHighlightMask(rows, cells, { dilationIterations: 0 })).toEqual([[false, true]]);
  });

  test("dilation captures bright adjacent cells but honors the iteration cap", () => {
    const rows = ["#####"];
    const cells = [[
      cell("#", 240, 20, 20),
      cell("#", 255, 255, 255),
      cell("#", 255, 255, 255),
      cell("#", 255, 255, 255),
      cell("#", 255, 255, 255),
    ]];

    expect(createAutoHighlightMask(rows, cells, { dilationIterations: 2 })).toEqual([
      [true, true, true, false, false],
    ]);
  });

  test("run-length encodes highlighted row segments", () => {
    expect(encodeHighlightSegments([[false, true, true, false, true]])).toEqual([
      [0, 1, 3],
      [0, 4, 5],
    ]);
  });

  test("guardrail skips auto masks outside coverage bounds", () => {
    const rows = ["ABCDE"];
    const cells = [[
      cell("A", 255, 0, 0),
      cell("B", 255, 0, 0),
      cell("C", 255, 0, 0),
      cell("D", 255, 0, 0),
      cell("E", 255, 0, 0),
    ]];

    const result = buildHighlightFromCells({
      rows,
      cells,
      config: {},
      mode: "auto",
      iconName: "TooMuchIcon",
      warn: () => undefined,
    });

    expect(result.highlight).toBeNull();
    expect(result.skipped).toBe(true);
  });

  test("normalizes muddy mask colors into vivid bounded HSL", () => {
    const cells = [[cell("#", 0x93, 0x32, 0x37)]];
    const color = normalizeHighlightColor(cells, [[true]]);
    const hsl = rgbToHsl(hexToRgb(color));

    expect(color).toMatch(/^#[0-9a-f]{6}$/);
    expect(hsl.saturation).toBeGreaterThanOrEqual(0.7);
    expect(hsl.lightness).toBeGreaterThanOrEqual(0.5);
    expect(hsl.lightness).toBeLessThanOrEqual(0.65);
  });
});
