"use client";

import { useEffect } from "react";
import { Router } from "next/router";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import type { PropsWithChildren } from "react";
import { ThemeProvider } from "next-themes";
import { ColorModeProvider, DarkMode } from "./color-mode";

const system = createSystem(defaultConfig, {
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
  },
});

export const Provider = (props: PropsWithChildren) => {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      loaded: (posthog) => {
        if (process.env.NODE_ENV === "development") posthog.debug();
      },
      debug: process.env.NODE_ENV === "development",
    });

    const handleRouteChange = () => posthog.capture("$pageview");
    Router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      Router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);

  return (
    <PostHogProvider client={posthog}>
      <ThemeProvider attribute="class" forcedTheme="dark" enableSystem={false}>
        <ChakraProvider value={system}>
          <ColorModeProvider>
            <DarkMode>{props.children}</DarkMode>
          </ColorModeProvider>
        </ChakraProvider>
      </ThemeProvider>
    </PostHogProvider>
  );
};
