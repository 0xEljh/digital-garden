import { AnimatePresence, m } from "motion/react";
import { Box, Heading, Stack, Button, Flex, Text, Center, useBreakpointValue } from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from 'next/router';
import type { PortfolioEntry } from "@/types/portfolio";
import { LuDownload } from "react-icons/lu";
import { DynamicPrecomputedAsciiIcon } from "@/components/common/precomputed-ascii-icon";
import { useAnalytics } from "@/components/common/analytics-provider";

const MotionFlex = m.create(Flex);

// Fixed width constants to prevent layout shift
const EXPANDED_WIDTH = 384;
const COLLAPSED_WIDTH = 80;
const GAP = 8; // Chakra gap={2} = 0.5rem = 8px

export const PortfolioPreview = ({
  entries,
}: {
  entries: PortfolioEntry[];
}) => {
  const defaultPanel = entries.length > 0 ? entries[0].slug : null;
  const [expandedPanel, setExpandedPanel] = useState<string | null>(defaultPanel);
  const router = useRouter();
  const posthog = useAnalytics();
  // The collapsed rails are a hover interaction; on touch viewports show only
  // the featured card, full width.
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  const handleMouseEnter = (slug: string) => {
    setExpandedPanel(slug);

    posthog?.capture('portfolio_preview_expand', {
      portfolio_item: entries.find(entry => entry.slug === slug)?.title,
      portfolio_slug: slug,
      location: router.asPath
    });
  };

  // Calculate fixed container width: 1 expanded + (n-1) collapsed + gaps
  const containerWidth = EXPANDED_WIDTH + (entries.length - 1) * COLLAPSED_WIDTH + (entries.length - 1) * GAP;

  return (
    <Stack gap={6} w="full" align="center">
      <Heading size="md" fontFamily="heading" w="full" textAlign="left">
        body of work
      </Heading>

      <Stack direction="row"
        gap={2}
        overflow="auto"
        w="full"
        maxW={`${containerWidth}px`}
        onMouseLeave={() => setExpandedPanel(defaultPanel)}
      >
        {entries.map((entry) => {
          if (isMobile && expandedPanel !== entry.slug) return null;
          return (
            <MotionFlex
              key={entry.slug}
              h={{ base: "350px", md: "480px" }}
              borderRadius="xl"
              position="relative"
              backdropFilter="blur(8px)"
              border="1px solid"
              borderColor={
                expandedPanel === entry.slug ? "gray.700" : "gray.800"
              }
              bg={
                expandedPanel === entry.slug ? "gray.800" : "gray.800"
              }
              _before={{
                content: '""',
                position: "absolute",
                inset: 0,
                borderRadius: "xl",
                opacity: 0.2,
                bgGradient: `linear(to-br, transparent, transparent)`, // placeholder for now.
                zIndex: -1,
              }}
              initial={false}
              animate={{
                width:
                  expandedPanel === entry.slug
                    ? isMobile
                      ? "100%"
                      : "384px"
                    : "80px",
                opacity: 1,
                backgroundColor: expandedPanel === entry.slug ? "rgba(45, 55, 72, 0.4)" : "rgba(45, 55, 72, 0.2)",
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              onMouseEnter={() => handleMouseEnter(entry.slug)}
            >
              {/* Glass shine effect */}
              {expandedPanel === entry.slug && (
                <Box
                  position="absolute"
                  insetX="0"
                  top="0"
                  h="1px"
                  bgGradient="linear(to-r, transparent, gray.400, transparent)"
                />
              )}

              {/* Collapsed state */}
              {expandedPanel !== entry.slug && (
                <Flex
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  w="full"
                  h="full"
                >
                  <Text
                    as={m.div}
                    fontSize={{ base: "sm", md: "md" }}
                    color="fg.muted"
                    style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                    textWrap="pretty"
                    flex="none"
                    fontFamily="mono"
                  >
                    {entry.title}
                  </Text>
                </Flex>
              )}

              {/* Expanded state */}
              <AnimatePresence>
                {expandedPanel === entry.slug && (
                  <MotionFlex
                    flexDirection="column"
                    p={5}
                    h="full"
                    w="full"
                    overflow="hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    position="relative"
                  >
                    <Box
                      position="absolute"
                      top="0"
                      left="0"
                      width="100%"
                      height="100%"
                      zIndex={0}
                    >
                      <Center h="100%">
                        <DynamicPrecomputedAsciiIcon
                          iconName={entry.icon}
                          highlighted={expandedPanel === entry.slug}
                          noAnimation={true}
                        />
                      </Center>
                    </Box>
                    <Stack mb={3}>
                      <Heading size="md" color="white" fontFamily="heading">
                        {entry.title}
                      </Heading>
                    </Stack>

                    <Text color="gray.300" mb={5} fontSize="sm" lineHeight="relaxed" fontFamily="mono">
                      {entry.shortDescription}
                    </Text>

                    <Box mt="auto">
                      <Button
                        asChild
                        variant="solid"
                        bg="gray.700"
                        _hover={{ bg: "gray.600" }}
                        size="sm"
                        borderRadius="lg"
                        transition="colors 0.3s"
                      >
                        <Link href={`/portfolio/${entry.slug}`}
                          onClick={() => {
                            posthog?.capture('view_project_click', {
                              portfolio_item: entry.title,
                              portfolio_slug: entry.slug,
                              location: router.asPath
                            });
                          }}
                        >
                          Details
                        </Link>
                      </Button>
                    </Box>
                  </MotionFlex>
                )}
              </AnimatePresence>
            </MotionFlex>
          );
        })}
      </Stack>

      <Stack
        direction={{ base: "column-reverse", md: "row" }}
        gap={3}
        align="center"
        justify={{ base: "center", md: "flex-start" }}
        w="full"
        maxW={`${containerWidth}px`}
      >
        <Link href="/resume"
          onClick={() => {
            posthog?.capture('download_resume_click', {
              location: router.asPath
            });
          }}
        >
          <Text
            as="span"
            display="inline-flex"
            alignItems="center"
            gap={1}
            fontSize="xs"
            fontFamily="mono"
            color="accent.muted"
            _hover={{ color: "accent" }}
            transition="color 0.2s"
          >
            <LuDownload /> resume
          </Text>
        </Link>

        <Link href="/portfolio"
          onClick={() => {
            posthog?.capture('full_portfolio_click', {
              location: router.asPath
            });
          }}
        >
          <Text
            as="span"
            fontSize="xs"
            fontFamily="mono"
            color="accent.muted"
            _hover={{ color: "accent" }}
            transition="color 0.2s"
          >the rest →</Text>
        </Link>
      </Stack>
    </Stack>
  );
};
