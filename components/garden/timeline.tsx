import React, { useEffect, useRef, useState } from "react";
import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { Link } from "@/components/ui/link";
import { useScroll, useTransform, m } from "motion/react";

const MotionBox = m.create(Box);

const DEFAULT_BEAM_COLOR = "linear-gradient(to bottom, transparent, #06b6d4, #3b82f6, transparent)";
const DEFAULT_STICKY_TOP = { base: "4rem", md: "5rem" };

interface TimelineProps {
  children: React.ReactNode;
  stickyTop?: string | Record<string, string>;
  beamColor?: string;
  showDots?: boolean;
}

export function Timeline({
  children,
  stickyTop = DEFAULT_STICKY_TOP,
  beamColor = DEFAULT_BEAM_COLOR,
  showDots = true,
}: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const beamHeight = useTransform(scrollYProgress, [0, 1], [0, height]);
  const beamOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <Box ref={containerRef} w="full" my={10}>
      <Box ref={contentRef} position="relative" pb={10}>
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return child;
          return React.cloneElement(child as React.ReactElement<any>, {
            _stickyTop: stickyTop,
            _showDot: showDots,
            _isFirst: index === 0,
          });
        })}

        {/* Track background line */}
        <Box
          position="absolute"
          left={{ base: "7px", md: "7px" }}
          top={0}
          bottom={0}
          w="2px"
          bg="linear-gradient(to bottom, transparent 0%, var(--chakra-colors-gray-700) 10%, var(--chakra-colors-gray-700) 90%, transparent 100%)"
          css={{
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          }}
        />

        {/* Animated beam */}
        <Box
          position="absolute"
          left={{ base: "7px", md: "7px" }}
          top={0}
          w="2px"
          overflow="hidden"
          style={{ height: `${height}px` }}
        >
          <MotionBox
            position="absolute"
            insetX={0}
            top={0}
            w="2px"
            rounded="full"
            style={{
              height: beamHeight,
              opacity: beamOpacity,
              background: beamColor,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

interface TimelineEntryProps {
  date: string;
  title: React.ReactNode;
  href?: string;
  children?: React.ReactNode;
  // Internal props injected by Timeline parent
  _stickyTop?: string | Record<string, string>;
  _showDot?: boolean;
  _isFirst?: boolean;
}

export function TimelineEntry({
  date,
  title,
  href,
  children,
  _stickyTop = DEFAULT_STICKY_TOP,
  _showDot = true,
  _isFirst = false,
}: TimelineEntryProps) {
  const titleContent = (
    <Text
      fontFamily="Tickerbit"
      fontSize={{ base: "lg", md: "2xl" }}
      fontWeight="bold"
      color="gray.400"
      lineHeight="tight"
    >
      {title}
    </Text>
  );

  return (
    <Flex
      gap={{ base: 6, md: 10 }}
      pt={_isFirst ? 0 : { base: 8, md: 16 }}
      align="flex-start"
    >
      {/* Left: sticky header */}
      <Box
        position={{ md: "sticky" }}
        top={_stickyTop}
        flexShrink={0}
        w={{ base: "auto", md: "200px" }}
        zIndex={10}
        alignSelf="flex-start"
      >
        <Flex align="center" gap={3}>
          {/* Dot */}
          {_showDot && (
            <Box position="relative" flexShrink={0}>
              <Box
                w="16px"
                h="16px"
                rounded="full"
                bg="gray.900"
                border="2px solid"
                borderColor="gray.600"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Box w="6px" h="6px" rounded="full" bg="gray.500" />
              </Box>
            </Box>
          )}

          <Stack gap={0}>
            <Text
              fontSize="xs"
              fontFamily="Aeion Mono"
              color="gray.500"
              letterSpacing="wide"
            >
              {date}
            </Text>
            {/* Desktop title (sticky) */}
            <Box display={{ base: "none", md: "block" }}>
              {href ? (
                <Link href={href} _hover={{ color: "cyan.400" }}>
                  {titleContent}
                </Link>
              ) : (
                titleContent
              )}
            </Box>
          </Stack>
        </Flex>
      </Box>

      {/* Right: content area */}
      <Box flex={1} pl={{ base: 4, md: 0 }} pb={4}>
        {/* Mobile title (non-sticky) */}
        <Box display={{ base: "block", md: "none" }} mb={3}>
          {href ? (
            <Link href={href} _hover={{ color: "cyan.400" }}>
              {titleContent}
            </Link>
          ) : (
            titleContent
          )}
        </Box>

        {children && (
          <Stack gap={3}>
            {children}
          </Stack>
        )}
      </Box>
    </Flex>
  );
}
