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
import { ColorModeProvider, DarkMode } from "./color-mode";
import { AnalyticsProvider } from "@/components/common/analytics-provider";

const buttonRecipe = defineRecipe({
  base: {
    fontFamily: "mono",
  },
});

const customConfig = defineConfig({
  globalCss: {
    body: {
      colorPalette: "teal",
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
        // Status-line palette: graphite UI, patina signal, brass secondary data.
        accent: {
          DEFAULT: { value: "{colors.teal.400}" },
          emphasized: { value: "{colors.teal.200}" },
          muted: { value: "{colors.teal.500}" },
          subtle: { value: "{colors.teal.950}" },
          surface: { value: "{colors.teal.900}" },
          border: { value: "{colors.teal.800}" },
        },
        data: {
          dev: { value: "{colors.teal.300}" },
          design: { value: "{colors.orange.300}" },
          other: { value: "{colors.gray.500}" },
          rail: { value: "{colors.gray.800}" },
        },
        edge: {
          muted: { value: "{colors.gray.800}" },
          default: { value: "{colors.gray.700}" },
          accent: { value: "{colors.teal.700}" },
        },
        surface: {
          panel: { value: "{colors.gray.900}" },
          raised: { value: "{colors.gray.800}" },
        },
        text: {
          meta: { value: "{colors.gray.500}" },
        },
        // Maturity as a coherent green→teal ramp (a note "greens into
        // evergreen"), replacing the green/yellow/teal mix — keeps the whole
        // site in the teal family. Used by badges, prose glyphs, and the garden.
        stage: {
          seedling: { value: "{colors.green.400}" },
          budding: { value: "{colors.teal.300}" },
          evergreen: { value: "{colors.teal.200}" },
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

const system = createSystem(defaultConfig, customConfig);

export const Provider = (props: PropsWithChildren) => {
  return (
    <AnalyticsProvider>
      <ThemeProvider attribute="class" forcedTheme="dark" enableSystem={false}>
        <ChakraProvider value={system}>
          <ColorModeProvider>
            <DarkMode>{props.children}</DarkMode>
          </ColorModeProvider>
        </ChakraProvider>
      </ThemeProvider>
    </AnalyticsProvider>
  );
};
