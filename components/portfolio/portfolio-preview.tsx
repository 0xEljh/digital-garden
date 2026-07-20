import { AnimatePresence, m } from "motion/react";
import { Box, Heading, Stack, Button, Flex, Text, Center, useBreakpointValue } from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from 'next/router';
import type { PortfolioEntry } from "@/types/portfolio";
import { LuDownload } from "react-icons/lu";
import { DynamicPrecomputedAsciiIcon } from "@/components/common/precomputed-ascii-icon";
import { useAnalytics } from "@/components/common/analytics-provider";
import { usePrefersReducedMotion } from "@/components/animations/use-prefers-reduced-motion";

const MotionFlex = m.create(Flex);

// Fixed width constants to prevent layout shift (desktop rail mode)
const EXPANDED_WIDTH = 384;
const COLLAPSED_WIDTH = 80;
const GAP = 8; // Chakra gap={2} = 0.5rem = 8px

// Mobile accordion heights: expanded card + collapsed row rails
const MOBILE_EXPANDED_HEIGHT = 360;
const MOBILE_COLLAPSED_HEIGHT = 52;

export const PortfolioPreview = ({
  entries,
}: {
  entries: PortfolioEntry[];
}) => {
  const defaultPanel = entries.length > 0 ? entries[0].slug : null;
  const [expandedPanel, setExpandedPanel] = useState<string | null>(defaultPanel);
  const router = useRouter();
  const posthog = useAnalytics();
  const prefersReducedMotion = usePrefersReducedMotion();
  // Desktop: horizontal rails, hover to expand. Mobile: vertical accordion,
  // tap to expand — every entry stays visible as a full-width row.
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  const expandPanel = (slug: string) => {
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

      <Stack
        direction={{ base: "column", md: "row" }}
        gap={2}
        overflow={{ base: "visible", md: "auto" }}
        w="full"
        maxW={{ base: "full", md: `${containerWidth}px` }}
        onMouseLeave={() => {
          if (!isMobile) setExpandedPanel(defaultPanel);
        }}
      >
        {entries.map((entry) => {
          const expanded = expandedPanel === entry.slug;
          return (
            <MotionFlex
              key={entry.slug}
              borderRadius="xl"
              position="relative"
              backdropFilter="blur(8px)"
              border="1px solid"
              borderColor={expanded ? "edge.default" : "edge.muted"}
              bg={expanded ? "surface.raised/50" : "surface.panel/40"}
              transitionProperty="background, border-color"
              transitionDuration="0.4s"
              cursor={expanded ? "default" : "pointer"}
              initial={false}
              animate={
                isMobile
                  ? {
                      width: "100%",
                      height: expanded
                        ? MOBILE_EXPANDED_HEIGHT
                        : MOBILE_COLLAPSED_HEIGHT,
                    }
                  : {
                      width: expanded
                        ? `${EXPANDED_WIDTH}px`
                        : `${COLLAPSED_WIDTH}px`,
                      height: 480,
                    }
              }
              transition={prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.5, ease: "easeInOut" }}
              role={expanded ? undefined : "button"}
              tabIndex={expanded ? undefined : 0}
              aria-expanded={expanded}
              aria-label={expanded ? undefined : `Expand ${entry.title}`}
              _focusVisible={{ outline: "2px solid", outlineColor: "accent", outlineOffset: "2px" }}
              onMouseEnter={() => {
                if (!isMobile) expandPanel(entry.slug);
              }}
              onClick={() => {
                if (!expanded) expandPanel(entry.slug);
              }}
              onKeyDown={(event) => {
                if (!expanded && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  expandPanel(entry.slug);
                }
              }}
            >
              {/* Glass shine effect */}
              {expanded && (
                <Box
                  position="absolute"
                  insetX="0"
                  top="0"
                  h="1px"
                  bg="accent.border"
                  opacity={0.7}
                />
              )}

              {/* Collapsed state — vertical spine on desktop, row rail on mobile */}
              {!expanded &&
                (isMobile ? (
                  <Flex alignItems="center" w="full" h="full" px={4} gap={2}>
                    <Text as="span" color="accent.muted" fontFamily="mono" fontSize="sm">
                      ▸
                    </Text>
                    <Text fontSize="sm" color="fg.muted" fontFamily="mono" truncate>
                      {entry.title}
                    </Text>
                  </Flex>
                ) : (
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
                ))}

              {/* Expanded state */}
              <AnimatePresence>
                {expanded && (
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
                          highlighted={expanded}
                          noAnimation
                        />
                      </Center>
                    </Box>
                    <Stack mb={3}>
                      <Heading size="md" color="text.body" fontFamily="heading">
                        {entry.title}
                      </Heading>
                    </Stack>

                    <Text color="text.muted" mb={5} fontSize="sm" lineHeight="relaxed" fontFamily="mono">
                      {entry.shortDescription}
                    </Text>

                    <Box mt="auto">
                      <Button
                        asChild
                        variant="outline"
                        borderColor="edge.default"
                        color="text.body"
                        bg="surface.page/40"
                        _hover={{
                          borderColor: "accent",
                          color: "accent.emphasized",
                          bg: "accent.subtle",
                        }}
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
                          details
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
        maxW={{ base: "full", md: `${containerWidth}px` }}
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
