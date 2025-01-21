// force dark mode
import { useColorMode } from "@chakra-ui/react";

export function useDarkMode() {
  const { colorMode, toggleColorMode } = useColorMode();
  const setDarkMode = () => {
    if (colorMode === "light") {
      // remove chakra-ui color mode from local storage
      localStorage.removeItem("chakra-ui-color-mode");
      {
        toggleColorMode();
      }
    }
  };
  return { setDarkMode };
}
