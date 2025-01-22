import {
  Box,
  ButtonProps,
  IconButton,
  Stack,
  Container,
  Text,
  Button,
  ButtonGroup,
} from "@chakra-ui/react";
import { BlurryOverlay } from "@/components/BlurryOverlay";

interface NavBarProps {
  children?: React.ReactNode;
}

export function NavBar({ children }: NavBarProps) {
  // this is desktop only, but handling toggle is parent's responsbility.
  return (
    <BlurryOverlay>
      <Box w="full">{children}</Box>
    </BlurryOverlay>
  );
}

interface MobileNavProps extends ButtonProps {}

export function MobileNav({ ...props }: MobileNavProps) {
  return <IconButton aria-label="Navigation menu" {...props}></IconButton>;
}
