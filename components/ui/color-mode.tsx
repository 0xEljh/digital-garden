"use client";

import type { SpanProps } from "@chakra-ui/react";
import { Span } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import * as React from "react";

export type ColorModeProviderProps = ThemeProviderProps;

export function ColorModeProvider(props: ColorModeProviderProps) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
  );
}

export const DarkMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function DarkMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme dark"
        colorScheme="dark"
        ref={ref}
        {...props}
      />
    );
  }
);
