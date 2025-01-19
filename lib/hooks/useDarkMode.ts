// force dark mode
import { useColorMode } from "@chakra-ui/react";

export function useDarkMode() {
  // remove chakra-ui color mode from local storage
  // localStorage.removeItem("chakra-ui-color-mode");
  const { colorMode, toggleColorMode } = useColorMode();
  const setDarkMode = () => {
    if (colorMode === "light") toggleColorMode();
    // remove chakra-ui color mode from local storage
    localStorage.removeItem("chakra-ui-color-mode");
  };
  return { setDarkMode };
}