import {
  Box,
  Center,
  CollapsibleContent,
  CollapsibleRoot,
  Container,
  HStack,
  Spacer,
  Stack,
  Text,
  type BoxProps,
  type StackProps,
} from "@chakra-ui/react";
import { Link } from "@/components/ui/link";
import { CollapsibleTrigger } from "@/components/ui/collapsible-trigger";
import { useCommandPalette } from "@/components/common/command-palette";

const NAV_ITEMS = [
  { label: "home", href: "/" },
  { label: "portfolio", href: "/portfolio" },
  { label: "log", href: "/posts" },
  { label: "stats", href: "/dashboard" },
] as const;

export const NavbarLinks = (props: StackProps) => {
  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      gap={{ base: "6", md: "8" }}
      {...props}
    >
      {NAV_ITEMS.map((item, index) => (
        <HStack key={item.href} gap={{ base: "0", md: "8" }}>
          <Link
            fontFamily="heading"
            fontWeight="medium"
            color="fg.muted"
            _hover={{ color: "accent.emphasized", textDecoration: "none" }}
            href={item.href}
          >
            {item.label}
          </Link>
          {index < NAV_ITEMS.length - 1 && (
            <Text hideBelow="md" color="text.meta" fontFamily="mono" aria-hidden>
              ·
            </Text>
          )}
        </HStack>
      ))}
    </Stack>
  );
};

function SearchAnchor(props: BoxProps) {
  const palette = useCommandPalette();

  return (
    <Box
      as="button"
      px={2.5}
      py={1}
      borderWidth="1px"
      borderColor="accent.border"
      borderRadius="l2"
      bg="accent.surface"
      color="accent.emphasized"
      fontFamily="mono"
      fontSize="xs"
      lineHeight={1}
      cursor="pointer"
      _hover={{ borderColor: "accent", color: "accent" }}
      onClick={() => palette.open("nav")}
      {...props}
    >
      [ /search ⌘k ]
    </Box>
  );
}

export function NavBar() {
  return (
    <Center
      position="sticky"
      zIndex="docked"
      top={{ base: "0", md: "4" }}
      left="4"
      right="4"
    >
      <Container
        css={`
          background-color: transparent;
          background-image: radial-gradient(transparent 1px, var(--chakra-colors-edge-muted) 1px);
          background-size: 4px 4px;
          backdrop-filter: blur(3px);
          mask: linear-gradient(rgb(0, 0, 0) 60%, rgba(0, 0, 0, 0) 100%);
        `}
        borderRadius="l3"
        boxShadow="xs"
        maxW={{ base: "full", md: "fit-content" }}
        px="4"
        py="3"
      >
        <CollapsibleRoot>
          <HStack gap={{ base: "3", md: "8" }}>
            <Spacer hideFrom="md" />
            <NavbarLinks hideBelow="md" />
            <SearchAnchor hideBelow="md" />
            {/* <Button size={{ base: "sm", md: "md" }}>Buy Now</Button> */}
            <CollapsibleTrigger />
          </HStack>
          <CollapsibleContent hideFrom="md">
            <NavbarLinks pt="5" pb="2" alignItems="center" />
            <SearchAnchor mx="auto" mt="3" mb="2" />
          </CollapsibleContent>
        </CollapsibleRoot>
      </Container>
    </Center>
  );
}
