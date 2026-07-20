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

  // Quiet chip on mobile (no keyboard, no ⌘k, no accent fill — it sits next
  // to the menu trigger); full accent-anchored form on desktop.
  return (
    <Box
      as="button"
      px={2.5}
      py={1}
      borderWidth="1px"
      borderColor={{ base: "edge.default", md: "accent.border" }}
      borderRadius="l2"
      bg={{ base: "transparent", md: "accent.surface" }}
      color={{ base: "fg.muted", md: "accent.emphasized" }}
      fontFamily="mono"
      fontSize="xs"
      lineHeight={1}
      cursor="pointer"
      whiteSpace="nowrap"
      _hover={{ borderColor: "accent", color: "accent" }}
      onClick={() => palette.open("nav")}
      {...props}
    >
      [ /search<Box as="span" hideBelow="md"> ⌘k</Box> ]
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
            {/* Search stays reachable without opening the menu. */}
            <NavbarLinks hideBelow="md" />
            <SearchAnchor />
            <CollapsibleTrigger />
          </HStack>
          <CollapsibleContent
            hideFrom="md"
            _open={{ _motionReduce: { animationName: "none" } }}
            _closed={{ _motionReduce: { animationName: "none" } }}
          >
            <NavbarLinks pt="5" pb="2" alignItems="center" />
          </CollapsibleContent>
        </CollapsibleRoot>
      </Container>
    </Center>
  );
}
