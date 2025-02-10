import {
  Box,
  Heading,
  Text,
  Stack,
  Tag,
  Link,
  useColorModeValue,
  Flex,
  useBoolean,
  useBreakpointValue,
} from "@chakra-ui/react";
import { PortfolioEntry } from "@/types/portfolio";
import { useInView } from "motion/react";
import { useEffect, useRef } from "react";
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
  const [isHovered, setIsHovered] = useBoolean();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 1.0 });

  useEffect(() => {
    if (isInView && isMobile) setIsHovered.on();
    if (!isInView && isMobile) setIsHovered.off();
    // detect state transition between mobile and desktop
  }, [isMobile, isInView]);

  useEffect(() => {
    if (!isMobile) setIsHovered.off();
  }, [isMobile]);

  return (
    <Link
      _hover={{ textDecor: "none" }}
      role="group"
      href={"/portfolio/" + entry.slug}
      isExternal
      onMouseEnter={setIsHovered.on}
      onMouseLeave={setIsHovered.off}
    >
      <Box
        // bg={isHighlighted ? "blue.800" : "black"}
        height="100%"
        _groupHover={{ shadow: "dark" }}
        position="relative"
        bg="black"
        minH="xs"
        ref={ref}
      >
        <Flex
          position="absolute"
          top="5"
          right="0"
          p="1.5"
          zIndex={0}
          maxWidth="80%" // Ensure the box doesn't exceed the width of the Flex container
        >
          {/* <Text
            opacity="0"
            transition="opacity 0.3s"
            _groupHover={{ opacity: 1 }}
            color="gray.300"
            overflowWrap={"break-word"}
            fontFamily="Aeion Mono"
            fontWeight={40}
            fontSize={{ base: "sm", md: "md" }}
          >
            {entry.shortDescription}
          </Text> */}
          <IconComponent
            boxSize={40}
            highlightColor="yellow.400"
            isHighlighted={isHighlighted || isHovered}
          />
        </Flex>
        <Flex direction="column-reverse" height="100%">
          <Stack
            spacing="3"
            alignSelf="start"
            w="xs"
            paddingEnd="16"
            paddingTop="8"
            paddingBottom="4"
            px={4}
            zIndex={10}
          >
            <Box
              position="absolute"
              top="2"
              left="2"
              fontSize="sm"
              color="fg.muted"
              opacity="0"
              transition="opacity 0.3s"
              _groupHover={{ opacity: 1 }}
            >
              {entry.shortDescription}
            </Box>
            <Stack spacing="3" mt="8">
              {entry.categories.map((category) => (
                <Text
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
                size={{ base: "xs", md: "sm" }}
                fontFamily={"Tickerbit"}
                color="whiteAlpha.800"
              >
                {entry.title}
              </Heading>
            </Stack>
          </Stack>
        </Flex>
      </Box>
    </Link>
  );
};
