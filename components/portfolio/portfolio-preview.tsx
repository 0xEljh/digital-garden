import { AnimatePresence, m } from "motion/react";
import { Box, Heading, Stack, Button, Flex, Text, Center } from "@chakra-ui/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import type { PortfolioEntry } from "@/types/portfolio";
import { LuDownload } from "react-icons/lu";
import { getIconComponent } from "@/lib/utils/portfolio-icons";
import { useAnalytics } from "@/components/common/analytics-provider";

const MotionFlex = m.create(Flex);

export const PortfolioPreview = ({
  entries,
}: {
  entries: PortfolioEntry[];
}) => {
  const [expandedPanel, setExpandedPanel] = useState<string | null>(entries.length > 0 ? entries[0].slug : null);
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const posthog = useAnalytics();

  // Auto-collapse panels when not hovered
  useEffect(() => {
    if (!isHovered && expandedPanel) {
      const timer = setTimeout(() => {
        setExpandedPanel(null);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [isHovered, expandedPanel]);

  const handleMouseEnter = (slug: string) => {
    setExpandedPanel(slug);
    setIsHovered(true);

    posthog?.capture('portfolio_preview_expand', {
      portfolio_item: entries.find(entry => entry.slug === slug)?.title,
      portfolio_slug: slug,
      location: router.asPath
    });
  };

  return (
    <Stack gap={6} w="full" align="center">
      <Heading size="md" fontFamily="Topoline" fontWeight="100" w="full" textAlign="left">
        Recent works
      </Heading>

      <Stack direction="row"
        gap={2}
        overflow="auto"
        w="full"
        onMouseLeave={() => setIsHovered(false)}
      >
        {entries.map((entry) => {
          const IconComponent = getIconComponent(entry.icon);

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
                width: expandedPanel === entry.slug ? "384px" : "80px",
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
                    fontFamily="Aeion Mono"
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
                        {IconComponent && (
                          <IconComponent
                            highlightColor="yellow.400"
                            isHighlighted={false}
                            noAnimation={true}
                          />
                        )}
                      </Center>
                    </Box>
                    <Stack mb={3}>
                      <Heading size="md" color="white" fontFamily={"Tickerbit"}>
                        {entry.title}
                      </Heading>
                    </Stack>

                    <Text color="gray.300" mb={5} fontSize="sm" lineHeight="relaxed" fontFamily={"Aeion Mono"}>
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

      <Stack direction={{ base: "column-reverse", md: "row" }}>
        {/* <Button */}
        {/*   colorScheme="teal" */}
        {/*   variant="outline" */}
        {/*   size="md" */}
        {/*   alignSelf="center" */}
        {/*   asChild */}
        {/* > */}
        {/*   <Link href="/api/download-resume" */}
        {/*     onClick={() => { */}
        {/*       posthog.capture('download_resume_click', { */}
        {/*         location: router.asPath */}
        {/*       }); */}
        {/*     }} */}
        {/*   > */}
        {/*     <LuDownload /> */}
        {/*     Resume */}
        {/*   </Link> */}
        {/* </Button> */}
        <Button
          asChild
          colorScheme="teal"
          variant="outline"
          size="md"
          alignSelf="center"
        >
          <Link href="/portfolio"
            onClick={() => {
              posthog?.capture('full_portfolio_click', {
                location: router.asPath
              });
            }}
          >Body of work</Link>
        </Button>
      </Stack>
    </Stack>
  );
};
