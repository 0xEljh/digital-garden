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
    fontFamily: "'Aeion Mono', monospace",
  },
});

const customConfig = defineConfig({
  globalCss: {
    body: {
      colorPalette: "cyan",
    },
  },
  theme: {
    tokens: {
      fonts: {
        body: { value: "var(--font-body)" },
      },
    },
    semanticTokens: {
      radii: {
        l1: { value: "0.125rem" },
        l2: { value: "0.25rem" },
        l3: { value: "0.375rem" },
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

