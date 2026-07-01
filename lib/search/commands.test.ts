import { describe, expect, test } from "bun:test";
import { COMMANDS, matchCommands, parseInput } from "./commands";

describe("parseInput", () => {
  test("plain text is search mode", () => {
    expect(parseInput("")).toEqual({ mode: "search", query: "" });
    expect(parseInput("attention")).toEqual({ mode: "search", query: "attention" });
  });

  test("a leading slash is command mode", () => {
    expect(parseInput("/")).toEqual({ mode: "command", verb: "", arg: "" });
    expect(parseInput("/random")).toEqual({ mode: "command", verb: "random", arg: "" });
  });

  test("verb is lowercased; arg is the remainder after a space", () => {
    expect(parseInput("/RANDOM")).toEqual({ mode: "command", verb: "random", arg: "" });
    expect(parseInput("/goto posts")).toEqual({
      mode: "command",
      verb: "goto",
      arg: "posts",
    });
  });
});

describe("matchCommands", () => {
  test("empty verb lists the browsable commands and hides eggs", () => {
    const listed = matchCommands(COMMANDS, "");
    expect(listed.length).toBeGreaterThan(0);
    expect(listed.every((c) => c.kind !== "egg")).toBe(true);
    expect(listed.some((c) => c.verb === "random")).toBe(true);
  });

  test("a verb fragment fuzzy-filters the list", () => {
    expect(matchCommands(COMMANDS, "rand").map((c) => c.verb)).toEqual(["random"]);
  });

  test("a matching fragment can surface an otherwise-hidden egg", () => {
    expect(matchCommands(COMMANDS, "whoami").map((c) => c.verb)).toContain("whoami");
  });

  test("no match yields an empty list", () => {
    expect(matchCommands(COMMANDS, "zzzzz")).toEqual([]);
  });
});

describe("COMMANDS registry", () => {
  test("verbs are unique, slash-free, and labels carry the slash", () => {
    const verbs = COMMANDS.map((c) => c.verb);
    expect(new Set(verbs).size).toBe(verbs.length);
    for (const c of COMMANDS) {
      expect(c.verb.startsWith("/")).toBe(false);
      expect(c.label).toBe(`/${c.verb}`);
      expect(typeof c.run).toBe("function");
    }
  });

  test("includes the resolved nav verbs and the eggs", () => {
    const verbs = COMMANDS.map((c) => c.verb);
    for (const v of ["random", "home", "posts", "portfolio"]) {
      expect(verbs).toContain(v);
    }
    expect(verbs).toContain("whoami"); // egg
    expect(verbs).toContain("respawn"); // egg
  });
});
