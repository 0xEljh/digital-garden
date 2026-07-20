"use client";

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
} from "@chakra-ui/react";
import type { PropsWithChildren } from "react";
import { ThemeProvider } from "next-themes";
import { AnalyticsProvider } from "@/components/common/analytics-provider";
import { DEFAULT_DISPLAY_THEME, DISPLAY_THEMES } from "@/lib/display-theme";

const themed = (
  kanagawa: string,
  flexoki: string,
  nier: string,
  phosphor: string,
) => ({
  value: {
    base: kanagawa,
    _flexoki: flexoki,
    _nier: nier,
    _phosphor: phosphor,
  },
});

const buttonRecipe = defineRecipe({
  base: {
    fontFamily: "mono",
  },
});

const customConfig = defineConfig({
  conditions: {
    flexoki: "[data-theme=flexoki] &",
    nier: "[data-theme=nier] &",
    phosphor: "[data-theme=phosphor] &",
  },
  globalCss: {
    // Color mode is forced dark via className="dark" on <Html> (_document.tsx).
    // Do NOT reintroduce a <DarkMode>/<Theme> wrapper span: any `.chakra-theme`
    // element re-declares every token's base value on itself, shadowing the
    // [data-theme=*] overrides that only ever land on <html>.
    html: {
      colorScheme: "dark",
    },
    body: {
      bg: "surface.page",
      color: "text.body",
      colorPalette: "brand",
    },
  },
  theme: {
    tokens: {
      // Single source of truth for the brand fonts. Components reference these
      // tokens (fontFamily="heading" | "display" | "mono"); swap a face here once.
      fonts: {
        body: { value: "var(--font-body)" },
        heading: { value: "'Tickerbit', monospace" },
        display: { value: "'Topoline', sans-serif" },
        mono: { value: "'Aeion Mono', monospace" },
      },
      radii: {
        l1: { value: "0.125rem" },
        l2: { value: "0.25rem" },
        l3: { value: "0.375rem" },
      },
    },
    semanticTokens: {
      colors: {
        // Expedition-console palette. Values are judged in situ via data-theme;
        // do not use _dark here, because DarkMode is a nearer ancestor.
        accent: {
          DEFAULT: themed("#7E9CD8", "#3AA99F", "#B4AF9A", "#FF9D00"),
          emphasized: themed("#7FB4CA", "#5ABDAC", "#CCC8B1", "#FFB347"),
          muted: themed("#658594", "#24837B", "#8F8A75", "#C77E00"),
          subtle: themed("#223249", "#102F2D", "#28251E", "#2F1D00"),
          surface: themed("#16161D", "#161B1A", "#302E27", "#1F170A"),
          border: themed("#2D4F67", "#20514C", "#5A5444", "#5C3900"),
        },
        spike: {
          DEFAULT: themed("#FFA066", "#DA702C", "#CD664D", "#FF2A00"),
        },
        data: {
          dev: themed("#7FB4CA", "#4385BE", "#B4AF9A", "#FF9D00"),
          design: themed("#FFA066", "#DA702C", "#CD664D", "#00FF66"),
          other: themed("#727169", "#878580", "#8F8A75", "#71717A"),
          rail: themed("#363646", "#282726", "#403D33", "#27272A"),
        },
        edge: {
          muted: themed("#363646", "#282726", "#403D33", "#27272A"),
          default: themed("#54546D", "#403E3C", "#5A5444", "#3F3F46"),
          accent: themed("#2D4F67", "#20514C", "#5A5444", "#5C3900"),
        },
        surface: {
          page: themed("#1F1F28", "#100F0F", "#292824", "#0A0A0A"),
          panel: themed("#2A2A37", "#1C1B1A", "#35332C", "#18181B"),
          raised: themed("#363646", "#282726", "#403D33", "#27272A"),
        },
        text: {
          body: themed("#DCD7BA", "#CECDC3", "#DCD8C0", "#E8E6E3"),
          // Secondary copy: warmer + brighter than meta (a ~60/40 body/meta
          // mix per palette) so it tracks the theme, unlike Chakra's fg.muted.
          muted: themed("#B4B09B", "#B3B1AA", "#BFBAA4", "#BBB9BB"),
          meta: themed("#727169", "#878580", "#8F8A75", "#71717A"),
        },
        // Discovery states brighten as the territory gets known.
        state: {
          sighted: themed("#658594", "#24837B", "#8F8A75", "#8A5A00"),
          charted: themed("#7E9CD8", "#3AA99F", "#B4AF9A", "#C77E00"),
          mapped: themed("#A3D4D5", "#87D3C3", "#DCD8C0", "#FF9D00"),
        },
        // Themed color palette so components that rely on the global
        // colorPalette (outline icon buttons, subtle tags) follow the active
        // display theme instead of a hardcoded Chakra family.
        brand: {
          solid: { value: "{colors.accent}" },
          contrast: { value: "{colors.surface.page}" },
          fg: { value: "{colors.accent}" },
          muted: { value: "{colors.accent.border}" },
          subtle: { value: "{colors.accent.subtle}" },
          emphasized: { value: "{colors.accent.border}" },
          focusRing: { value: "{colors.accent}" },
        },
      },
    },
    textStyles: {
      meta: {
        value: {
          fontFamily: "mono",
          fontSize: "sm",
          color: "text.meta",
        },
      },
    },
    recipes: {
      button: buttonRecipe,
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);

export const Provider = (props: PropsWithChildren) => {
  return (
    <AnalyticsProvider>
      <ThemeProvider
        attribute="data-theme"
        themes={[...DISPLAY_THEMES]}
        defaultTheme={DEFAULT_DISPLAY_THEME}
        enableSystem={false}
        disableTransitionOnChange
      >
        <ChakraProvider value={system}>{props.children}</ChakraProvider>
      </ThemeProvider>
    </AnalyticsProvider>
  );
};
