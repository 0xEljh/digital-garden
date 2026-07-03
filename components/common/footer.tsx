import {
  Box,
  Container,
  HStack,
  Link as ChakraLink,
  Stack,
  Text,
} from "@chakra-ui/react";
import { NavbarLinks } from "@/components/common/nav";
import { SocialBar } from "@/components/common/social-bar";
import status from "@/lib/generated/expedition-status.json";
import { DEFAULT_DISPLAY_THEME } from "@/lib/display-theme";
import { useTheme } from "next-themes";

export function Footer() {
  const { theme } = useTheme();
  const display = theme ?? DEFAULT_DISPLAY_THEME;

  return (
    <Box
      as="footer"
      mt={{ base: 16, md: 24 }}
      borderTopWidth="1px"
      borderColor="edge.muted"
    >
      <Container maxW="container.lg" py={{ base: 8, md: 10 }}>
        <Stack gap={6}>
          <Stack
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            gap={6}
          >
            <NavbarLinks />
            <SocialBar size="sm" />
          </Stack>

          <Box
            as="details"
            color="text.meta"
            fontFamily="mono"
            fontSize="xs"
          >
            <Box
              as="summary"
              cursor="pointer"
              width="fit-content"
              _hover={{ color: "accent.emphasized" }}
            >
              legend
            </Box>
            <Text mt={2} maxW="68ch" lineHeight={1.7}>
              ✦ sighted → ✳ charted → ❋ mapped — entries brighten as the
              territory gets known; nothing here is ever quite done.
            </Text>
          </Box>

          <HStack
            justify="space-between"
            wrap="wrap"
            gap={3}
            color="text.meta"
            fontFamily="mono"
            fontSize="xs"
          >
            <Text suppressHydrationWarning>
              last updated {status.lastUpdatedLabel} · {status.postCount} entries ·{" "}
              {status.projectCount} projects · display: {display}
            </Text>
            <ChakraLink
              href="/rss.xml"
              color="text.meta"
              _hover={{ color: "accent.emphasized" }}
            >
              rss
            </ChakraLink>
          </HStack>
        </Stack>
      </Container>
    </Box>
  );
}
