import { describe, expect, test } from "bun:test";
import { search } from "./search";
import type { SearchRecord } from "./types";

/** Build a minimal record; `text` defaults to the lowercased title. */
const rec = (
  over: Partial<SearchRecord> & Pick<SearchRecord, "id" | "title">,
): SearchRecord => ({
  type: "post",
  url: `/x/${over.id}`,
  text: (over.text ?? over.title).toLowerCase(),
  ...over,
});

const records: SearchRecord[] = [
  rec({ id: "a", title: "Attention is all you need" }),
  rec({
    id: "b",
    title: "GPU programming, an intro",
    text: "gpu programming, an intro. mentions attention briefly.",
  }),
  rec({ id: "c", title: "Eigenform" }),
];

describe("search", () => {
  test("empty query returns all records in index order (capped by limit)", () => {
    const out = search(records, "");
    expect(out.map((r) => r.record.id)).toEqual(["a", "b", "c"]);
  });

  test("drops records that do not match", () => {
    expect(search(records, "zzzz")).toEqual([]);
  });

  test("ranks a title hit above a body-only hit", () => {
    // 'a' matches in its title; 'b' matches only in its body; 'c' not at all
    const out = search(records, "attention");
    expect(out.map((r) => r.record.id)).toEqual(["a", "b"]);
  });

  test("respects the limit", () => {
    expect(search(records, "", 2)).toHaveLength(2);
  });

  test("is case-insensitive", () => {
    expect(search(records, "EIGEN").map((r) => r.record.id)).toEqual(["c"]);
  });
});
