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
import { useEffect, useRef, useState, memo, useMemo } from "react";
import { getIconComponent } from "@/lib/utils/portfolio-icons";
import posthog from 'posthog-js';

interface PortfolioCardProps {
  entry: PortfolioEntry;
  isHighlighted?: boolean;
}

// Memoized icon component that only re-renders when props change
const MemoizedIcon = memo(({ 
  IconComponent, 
  width, 
  isHighlighted,
  shouldRender 
}: { 
  IconComponent: React.ComponentType<any>, 
  width: number,
  isHighlighted: boolean,
  shouldRender: boolean
}) => {
  // If we shouldn't render the component, return null or a placeholder
  if (!shouldRender) {
    return <Box width={width} height={width} />;
  }

  return (
    <IconComponent
      width={width}
      highlightColor="yellow.400"
      isHighlighted={isHighlighted}
    />
  );
});

MemoizedIcon.displayName = 'MemoizedIcon';

export const PortfolioCard = ({
  entry,
  isHighlighted = false,
}: PortfolioCardProps) => {
  const IconComponent = getIconComponent(entry.icon);
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.8 });
  
  // Track if component has ever been in view
  const [hasBeenInView, setHasBeenInView] = useState(false);
  
  // Determine if we should render the ASCII icon
  // Only render it the first time it comes into view
  const shouldRenderIcon = useMemo(() => {
    if (isInView && !hasBeenInView) {
      setHasBeenInView(true);
    }
    return hasBeenInView;
  }, [isInView, hasBeenInView]);

  useEffect(() => {
    if (isInView && isMobile) setIsHovered(true);
    if (!isInView && isMobile) setIsHovered(false);
  }, [isMobile, isInView]);

  useEffect(() => {
    if (!isMobile) setIsHovered(false);
  }, [isMobile]);

  return (
    <Link
      height="100%"
      width="100%"
      _hover={{ textDecor: "none" }}
      className="group"
      href={"/portfolio/" + entry.slug}
      onClick={() => {
        posthog.capture('portfolio_card_click', {
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
            <MemoizedIcon
              IconComponent={IconComponent}
              width={220}
              isHighlighted={isHighlighted || isHovered}
              shouldRender={shouldRenderIcon}
            />
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
                fontFamily={"Tickerbit"}
              >
                {category}
              </Text>
            ))}
            <Heading
              textAlign="center"
              size={{ base: "md", md: "sm" }}
              fontFamily={"Tickerbit"}
              color="whiteAlpha.800"
            >
              {entry.title}
            </Heading>
          </Stack>
        </Flex>
        <Text
          position="absolute"
          top={{base: 8, md: 2}}
          left={{base: 6, md: 2}}
          fontSize="sm"
          color="fg.muted"
          opacity={isHovered ? 1 : 0}
          transition="opacity 0.3s"
          _groupHover={{ opacity: 1 }}
          maxW="sm"
          textWrap="break-word"
        >
          {entry.shortDescription}
        </Text>
      </Box>
    </Link>
  );
};
