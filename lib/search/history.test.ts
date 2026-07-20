import { describe, expect, test } from "bun:test";
import { pushHistory, type HistoryEntry } from "./history";

const rec = (id: string): HistoryEntry => ({ kind: "record", id });

describe("pushHistory", () => {
  test("prepends the newest entry", () => {
    expect(pushHistory([rec("a")], rec("b"))).toEqual([rec("b"), rec("a")]);
  });

  test("de-duplicates, moving a re-run entry to the front", () => {
    expect(pushHistory([rec("a"), rec("b")], rec("b"))).toEqual([rec("b"), rec("a")]);
  });

  test("distinguishes kind from id", () => {
    expect(
      pushHistory([{ kind: "record", id: "x" }], { kind: "command", id: "x" }),
    ).toEqual([
      { kind: "command", id: "x" },
      { kind: "record", id: "x" },
    ]);
  });

  test("caps at the max length, dropping the oldest", () => {
    const h = pushHistory([rec("1"), rec("2"), rec("3")], rec("4"), 3);
    expect(h.map((e) => e.id)).toEqual(["4", "1", "2"]);
  });
});
