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
import { useEffect, useRef, useState } from "react";
import { getIconComponent } from "@/lib/utils/portfolio-icons";

interface PortfolioCardProps {
  entry: PortfolioEntry;
  isHighlighted?: boolean;
}

export const PortfolioCard = ({
  entry,
  isHighlighted = false,
}: PortfolioCardProps) => {
  const IconComponent = getIconComponent(entry.icon);
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 1.0 });

  useEffect(() => {
    if (isInView && isMobile) setIsHovered(true);
    if (!isInView && isMobile) setIsHovered(false);
    // detect state transition between mobile and desktop
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
            <IconComponent
              width="100%"
              height="100%"
              highlightColor="yellow.400"
              isHighlighted={isHighlighted || isHovered}
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
            px={4}
            zIndex={10}
          >
            {entry.categories.map((category) => (
              <Text
                key={category}
                textStyle={{ base: "xs", md: "sm" }}
                fontWeight="semibold"
                // color={isHighlighted ? "accent" : "white"}
                opacity="0"
                transition="opacity 0.3s"
                _groupHover={{ opacity: 1 }}
                fontFamily={"Tickerbit"}
              >
                {category}
              </Text>
            ))}
            <Heading
              textAlign="center"
              size={{ base: "xs", md: "sm" }}
              fontFamily={"Tickerbit"}
              color="whiteAlpha.800"
            >
              {entry.title}
            </Heading>
          </Stack>
        </Flex>
        <Text
          position="absolute"
          top="2"
          left="2"
          fontSize="sm"
          color="fg.muted"
          opacity="0"
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
