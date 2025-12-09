import { NavBar } from "@/components/common/nav";
import { Stack } from "@chakra-ui/react";

interface LayoutProps {
  children: React.ReactNode;
}
export function DefaultLayout({ children }: LayoutProps) {

  return (
    <Stack gap={0}>
      <NavBar />
      {children}
    </Stack>
  );
}
