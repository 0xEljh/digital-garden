import { NavBar } from "@/components/common/nav";
import { Stack } from "@chakra-ui/react";

interface LayoutPorps {
  children: React.ReactNode;
}
export function DefaultLayout({ children }: LayoutPorps) {

  return (
    <Stack gap={0}>
      <NavBar />
      {children}
    </Stack>
  );
}
