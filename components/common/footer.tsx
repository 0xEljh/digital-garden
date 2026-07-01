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
import status from "@/lib/generated/garden-status.json";

export function Footer() {
  return (
    <Box
      as="footer"
      mt={{ base: 16, md: 24 }}
      borderTopWidth="1px"
      borderColor="gray.800"
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
            color="gray.500"
            fontFamily="mono"
            fontSize="xs"
          >
            <Box
              as="summary"
              cursor="pointer"
              width="fit-content"
              _hover={{ color: "cyan.400" }}
            >
              how this garden grows
            </Box>
            <Text mt={2} maxW="68ch" lineHeight={1.7}>
              seedling → budding → evergreen — a note starts rough and matures
              as it gets revisited, though nothing here is ever quite done. Each
              shows when it was planted and last tended.
            </Text>
          </Box>

          <HStack
            justify="space-between"
            wrap="wrap"
            gap={3}
            color="gray.600"
            fontFamily="mono"
            fontSize="xs"
          >
            <Text>
              last tended {status.lastTendedLabel} · {status.postCount} notes ·{" "}
              {status.projectCount} projects
            </Text>
            <ChakraLink
              href="/rss.xml"
              color="gray.600"
              _hover={{ color: "cyan.400" }}
            >
              rss
            </ChakraLink>
          </HStack>
        </Stack>
      </Container>
    </Box>
  );
}
