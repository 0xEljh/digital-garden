import { NavBar, MobileNav } from "@/components/Nav";
import { useBreakpointValue, Stack } from "@chakra-ui/react";

interface LayoutPorps {
  children: React.ReactNode;
}
export function DefaultLayout({ children }: LayoutPorps) {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Stack>
      {isMobile ? <MobileNav /> : <NavBar />}
      {children}
    </Stack>
  );
}
