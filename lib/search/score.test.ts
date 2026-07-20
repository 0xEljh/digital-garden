import { describe, expect, test } from "bun:test";
import { score } from "./score";

describe("score", () => {
  test("empty query is neutral (0), not a miss", () => {
    expect(score("", "attention is all you need")).toBe(0);
  });

  test("returns -1 when query is not a subsequence", () => {
    expect(score("xyz", "attention")).toBe(-1);
    expect(score("attn!", "attention")).toBe(-1); // '!' is absent from the text
  });

  test("a real subsequence scores positive", () => {
    expect(score("att", "attention")).toBeGreaterThan(0); // contiguous
    expect(score("atn", "attention")).toBeGreaterThan(0); // scattered but in order
  });

  test("is case-insensitive", () => {
    expect(score("ATT", "attention")).toBe(score("att", "attention"));
    expect(score("att", "ATTENTION")).toBeGreaterThan(0);
  });

  test("contiguous matches beat scattered ones", () => {
    // "att" is consecutive in "attention"; "atn" is spread across it
    expect(score("att", "attention")).toBeGreaterThan(score("atn", "attention"));
  });

  test("rewards matches at a word boundary", () => {
    // start-of-text boundary: 'a' opens "ab" vs 'a' buried after 'x' in "xab"
    expect(score("ab", "ab")).toBeGreaterThan(score("ab", "xab"));
    // post-separator boundary: 'w' opens "world" vs 'w' mid-"swords"
    expect(score("w", "hello world")).toBeGreaterThan(score("w", "swords"));
  });
});
