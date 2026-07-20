import { test, expect, describe } from "bun:test";
import {
  slugifyCategory,
  labelForCategory,
  normalizeCategory,
  isCanonicalCategory,
} from "./categories";

describe("slugifyCategory", () => {
  test("lowercases and hyphenates spaces", () => {
    expect(slugifyCategory("Deep Learning")).toBe("deep-learning");
  });
  test("trims surrounding whitespace", () => {
    expect(slugifyCategory("  GPU  ")).toBe("gpu");
  });
  test("collapses runs of non-alphanumerics", () => {
    expect(slugifyCategory("C / C++")).toBe("c-c");
  });
});

describe("labelForCategory", () => {
  test("defaults to lowercase words", () => {
    expect(labelForCategory("Deep Learning")).toBe("deep learning");
    expect(labelForCategory("machine-learning")).toBe("machine learning");
  });
  test("honors the exceptions map by slug, regardless of input casing", () => {
    expect(labelForCategory("pytorch", { pytorch: "PyTorch" })).toBe("PyTorch");
    expect(labelForCategory("PyTorch", { pytorch: "PyTorch" })).toBe("PyTorch");
  });
});

describe("normalizeCategory", () => {
  test("returns both slug and label", () => {
    expect(normalizeCategory("Deep Learning")).toEqual({
      slug: "deep-learning",
      label: "deep learning",
    });
  });
});

describe("isCanonicalCategory", () => {
  test("true when the raw value already equals its canonical label", () => {
    expect(isCanonicalCategory("deep learning")).toBe(true);
  });
  test("false when the raw value differs (casing)", () => {
    expect(isCanonicalCategory("Deep Learning")).toBe(false);
    expect(isCanonicalCategory("Pytorch")).toBe(false);
  });
});
