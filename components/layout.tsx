import { NavBar } from "@/components/common/nav";
import { Footer } from "@/components/common/footer";
import { Stack } from "@chakra-ui/react";

interface LayoutProps {
  children: React.ReactNode;
}
export function DefaultLayout({ children }: LayoutProps) {
  return (
    <Stack gap={0}>
      <NavBar />
      {children}
      <Footer />
    </Stack>
  );
}
