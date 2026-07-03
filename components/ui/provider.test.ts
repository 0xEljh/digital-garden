import { describe, expect, test } from "bun:test";
import { system } from "./provider";

describe("theme token emission", () => {
  test("emits display-theme overrides for the four expedition palettes", () => {
    const css = JSON.stringify(system.getTokenCss());

    expect(css).toContain("--chakra-colors-accent");
    expect(css).toContain("#7E9CD8");
    expect(css).toContain("[data-theme=flexoki]");
    expect(css).toContain("#3AA99F");
    expect(css).toContain("[data-theme=nier]");
    expect(css).toContain("#B4AF9A");
    expect(css).toContain("[data-theme=phosphor]");
    expect(css).toContain("#FF9D00");
  });
});
