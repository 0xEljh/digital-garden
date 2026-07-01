import type { Stage } from "@/lib/content/schema";
import { STAGE_GLYPH } from "@/lib/content/schema";

/**
 * Plant sprites for the side-view garden field. Rendered in a rich monospace
 * (see PLANT_FONT in garden-plot) so foliage can be solid block +
 * triangle glyphs that read as real game-tile trees, not an asterisk-on-a-Y.
 *
 * Two silhouettes per stage (a branchy form and a rounder form) so neighbouring
 * plants aren't byte-identical; `pickVariant` chooses one deterministically per
 * slug, so a post keeps its look as the corpus grows. Maturity is encoded three
 * ways regardless of variant: the stage glyph crown (✦/✳/❋), total height, and
 * canopy mass (seedling 3 → budding 5 → evergreen 7 lines). The surface adds a
 * light-source shade ramp (bright crown → dim trunk).
 */
const SPRITES: Record<Stage, string[][]> = {
  seedling: [
    ["◣│◢", "│"], // v0 — leaf-buds down-and-out
    ["◢│◣", "│"], // v1 — leaf-buds up-and-out
  ],
  budding: [
    ["◢█◣", "◢███◣", "█", "│"], // v0 — branchy young tree
    ["▟█▙", "▐███▌", "█", "│"], // v1 — rounder bush
  ],
  evergreen: [
    ["◢█◣", "◢███◣", "◢█◣", "◢███◣", "█", "█"], // v0 — layered conifer
    ["▟█▙", "▐███▌", "▟█▙", "▐███▌", "█", "█"], // v1 — rounded full tree
  ],
};

export function getPlantSprite(stage: Stage, variant = 0): string[] {
  const forms = SPRITES[stage];
  return [STAGE_GLYPH[stage], ...forms[variant % forms.length]];
}

/** Deterministic per-slug silhouette pick (djb2-ish), so a post's form is
 *  stable across builds even as the corpus changes around it. */
export function pickVariant(slug: string): 0 | 1 {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return (Math.abs(h) % 2) as 0 | 1;
}
