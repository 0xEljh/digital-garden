import { extendTheme, theme as baseTheme } from "@chakra-ui/react";
import { theme as proTheme } from "@chakra-ui/pro-theme";

export const theme = extendTheme(
  {
    colors: { ...baseTheme.colors, brand: baseTheme.colors.teal },
    config: {
      initialColorMode: "dark",
      useSystemColorMode: false, // Disable system color mode detection
    },
    // set global background:
    styles: {
      global: {
        "html, body": {
          bg: "black",
          color: "white",
          fontFamily: "Aeion Mono",
          fontWeight: "40",
        },
      },
    },
  },
  proTheme
);
