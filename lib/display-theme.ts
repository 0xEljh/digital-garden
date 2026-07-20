export const DISPLAY_THEMES = ["kanagawa", "flexoki", "nier", "phosphor"] as const;

export type DisplayTheme = (typeof DISPLAY_THEMES)[number];

export const DEFAULT_DISPLAY_THEME: DisplayTheme = "kanagawa";

export const DISPLAY_THEME_LABEL: Record<DisplayTheme, string> = {
  kanagawa: "kanagawa",
  flexoki: "flexoki",
  nier: "nier",
  phosphor: "phosphor",
};

export function isDisplayTheme(value: string): value is DisplayTheme {
  return (DISPLAY_THEMES as readonly string[]).includes(value);
}
