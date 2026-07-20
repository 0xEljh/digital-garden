/**
 * Expedition-log frontmatter vocabulary + forgiving coercion.
 *
 * `stage` is an authorial maturity judgment (NOT derived from age or edit
 * count). Absent stage defaults to sighted so every new note starts as a
 * logged detection, which is the behavior we want to make frictionless.
 */

export const STAGES = ["sighted", "charted", "mapped"] as const;
export type Stage = (typeof STAGES)[number];
export const DEFAULT_STAGE: Stage = "sighted";

/**
 * State glyphs — escalating density encodes discovery. Single source so prose
 * links, the command palette, star chart, and preview cards agree.
 */
export const STAGE_GLYPH: Record<Stage, string> = {
  sighted: "✦",
  charted: "✳",
  mapped: "❋",
};

export function glyphForStage(stage: Stage): string {
  return STAGE_GLYPH[stage];
}

export const CONFIDENCES = ["speculative", "likely", "solid"] as const;
export type Confidence = (typeof CONFIDENCES)[number];

export function coerceStage(raw: unknown): { stage: Stage; warning?: string } {
  if (raw == null) return { stage: DEFAULT_STAGE };
  if (typeof raw === "string" && (STAGES as readonly string[]).includes(raw)) {
    return { stage: raw as Stage };
  }
  return {
    stage: DEFAULT_STAGE,
    warning: `unknown stage "${String(raw)}", defaulted to ${DEFAULT_STAGE}`,
  };
}

export function coerceConfidence(raw: unknown): {
  confidence?: Confidence;
  warning?: string;
} {
  if (raw == null) return {};
  if (
    typeof raw === "string" &&
    (CONFIDENCES as readonly string[]).includes(raw)
  ) {
    return { confidence: raw as Confidence };
  }
  return { warning: `unknown confidence "${String(raw)}", ignored` };
}

/**
 * Derive a plain-text excerpt from MDX body when frontmatter omits one, so a
 * bare draft still renders well in cards / RSS / OG. Heuristic by design — this
 * is presentation text, not link extraction, so regex stripping is appropriate.
 */
export function deriveExcerpt(content: string, maxWords = 30): string {
  const text = content
    .replace(/```[\s\S]*?```/g, " ") // fenced code
    .replace(/`[^`]*`/g, " ") // inline code
    .replace(/^\s*import\s.*$/gm, " ") // mdx import
    .replace(/^\s*export\s.*$/gm, " ") // mdx export
    .replace(/<[^>]+>/g, " ") // jsx / html tags
    .replace(/^\s{0,3}#{1,6}\s+.*$/gm, " ") // ATX headings
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> link text
    .replace(/\$\$[\s\S]*?\$\$/g, " ") // block math
    .replace(/\$[^$\n]*\$/g, " ") // inline math
    .replace(/[*_>~#]+/g, " ") // emphasis / quote / heading markers
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "";
  const words = text.split(" ");
  const slice = words.slice(0, maxWords).join(" ");
  return words.length > maxWords ? `${slice}…` : slice;
}
