import heroAssets from "@/lib/generated/ascii-assets.json";

export type HeroAsciiWidth = "140" | "200" | "300";

export const HERO_ASCII = heroAssets.hero as {
  imagePath: string;
  cellAspect: number;
  widths: Record<HeroAsciiWidth, string>;
};
