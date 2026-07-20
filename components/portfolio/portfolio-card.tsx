import {
  Box,
  Heading,
  Text,
  Stack,
  Center,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Link } from "@/components/ui/link";
import { PortfolioEntry } from "@/types/portfolio";
import { useInView } from "motion/react";
import { useRef } from "react";
import { DynamicPrecomputedAsciiIcon } from "@/components/common/precomputed-ascii-icon";
import { useAnalytics } from "@/components/common/analytics-provider";
import { usePrefersReducedMotion } from "@/components/animations/use-prefers-reduced-motion";

interface PortfolioCardProps {
  entry: PortfolioEntry;
}

export const PortfolioCard = ({
  entry,
}: PortfolioCardProps) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.8 });
  const hasBeenInView = useInView(ref, { amount: 0.8, once: true });
  const posthog = useAnalytics();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isHovered = Boolean(isMobile && isInView);

  return (
    <Link
      height="100%"
      width="100%"
      _hover={{ textDecor: "none" }}
      className="group"
      href={"/portfolio/" + entry.slug}
      onClick={() => {
        posthog?.capture('portfolio_card_click', {
          portfolio_item: entry.title,
          portfolio_slug: entry.slug,
          categories: entry.categories
        });
      }}
    >
      <Box
        position="relative"
        w="100%"
        h="100%"
        bg="black"
        minH="xs"
        overflow="hidden"
        ref={ref}
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          zIndex={0}
        >
          <Center>
            {hasBeenInView && (
              <DynamicPrecomputedAsciiIcon
                iconName={entry.icon}
                highlighted={isHovered || "group-hover"}
                noAnimation={prefersReducedMotion}
              />
            )}
          </Center>
        </Box>
        <Flex direction="column-reverse" height="100%">
          <Stack
            gap="3"
            alignSelf="start"
            // w="md"
            paddingEnd="16"
            paddingTop="8"
            paddingBottom="4"
            px={{ base: 6, md: 4 }}
            zIndex={10}
          >
            {entry.categories.map((category) => (
              <Text
                key={category}
                textStyle={{ base: "xs", md: "sm" }}
                fontWeight="semibold"
                opacity={isHovered ? 1 : 0}
                transition="opacity 0.3s"
                _groupHover={{ opacity: 1 }}
                _groupFocusWithin={{ opacity: 1 }}
                fontFamily="heading"
              >
                {category}
              </Text>
            ))}
            <Heading
              textAlign="center"
              size={{ base: "md", md: "sm" }}
              fontFamily="heading"
              color="whiteAlpha.800"
            >
              {entry.title}
            </Heading>
          </Stack>
        </Flex>
        <Text
          position="absolute"
          top={{ base: 8, md: 2 }}
          left={{ base: 6, md: 2 }}
          fontSize="sm"
          color="fg.muted"
          opacity={isHovered ? 1 : 0}
          transition="opacity 0.3s"
          _groupHover={{ opacity: 1 }}
          _groupFocusWithin={{ opacity: 1 }}
          maxW="sm"
          textWrap="break-word"
          fontFamily="mono"
        >
          {entry.shortDescription}
        </Text>
      </Box>
    </Link>
  );
};
