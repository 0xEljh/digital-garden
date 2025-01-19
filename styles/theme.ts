import { extendTheme, theme as baseTheme } from "@chakra-ui/react";
import { theme as proTheme } from "@chakra-ui/pro-theme";

export const theme = extendTheme(
  {
    colors: { ...baseTheme.colors, brand: baseTheme.colors.teal },
  },
  proTheme,
);