import {
  Box,
  Center,
  Heading,
  Stack,
  Text,
  Button,
  Tag,
  HStack,
  Icon,
  Grid,
  GridItem,
  useBreakpointValue,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { motion } from "motion/react";
import { GetStaticPaths, GetStaticProps } from "next";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { loadPortfolioEntries } from "@/lib/utils/portfolio";
import { PortfolioEntry } from "@/types/portfolio";
import { getIconComponent } from "@/lib/utils/portfolio-icons";
import { VscBrowser, VscGithub } from "react-icons/vsc";
import { StyledProse } from "@/components/common/styled-prose";

interface ProjectPageProps {
  entry: PortfolioEntry;
  content: MDXRemoteSerializeResult;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const entries = await loadPortfolioEntries();

  return {
    paths: entries.map((entry) => ({
      params: { project: entry.slug },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<ProjectPageProps> = async ({
  params,
}) => {
  const entries = await loadPortfolioEntries();
  const entry = entries.find((e) => e.slug === params?.project);

  if (!entry) {
    return {
      notFound: true,
    };
  }

  const content = await serialize(entry.longDescription || "");

  return {
    props: {
      entry,
      content,
    },
  };
};

const MotionBox = motion.create(Box);

export default function ProjectPage({ entry, content }: ProjectPageProps) {
  const IconComponent = getIconComponent(entry.icon);
  const iconWidth = useBreakpointValue({ base: 240, md: 400, lg: 600 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <Grid
      templateColumns={{ base: "1fr", md: "repeat(6, 1fr)" }}
      templateRows={{ base: "1fr", md: "repeat(2, 1fr)" }}
      gap={4}
      position="relative"
      overflow="hidden"
      h="95vh"
    >
      <Center position="absolute" top={0} left={0} w="full" h="full" zIndex={0}>
        <IconComponent
          width={iconWidth}
          highlightColor={"yellow.500"}
          isHighlighted={true}
          scrambleAnimationDuration={8}
        />
      </Center>

      {/* Content: Occupy lower left quadrant */}
      <GridItem
        colSpan={{ base: 1, md: 3 }}
        rowStart={{ base: 1, md: 2 }}
        maxH={{ base: undefined, md: "50vh" }}
        zIndex={1}
      >
        <Stack
          flex={1}
          gap={4}
          bg={{ base: "blackAlpha.400", md: "blackAlpha.700" }}
          p={8}
          m={{ base: 0, md: 4 }}
          borderRadius="2xl"
          border="1px"
          borderColor={"cyan.700"}
          boxShadow="0 0 25px rgba(0, 200, 255, 0.20)"
          backdropFilter="blur(10px)"
          overflowY="scroll"
          h="100%"
          pr={4}
          css={{
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-track": {
              background: "rgba(0,0,0,0.1)",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(0, 200, 255, 0.5)",
              borderRadius: "2px",
            },
          }}
        >
          <Heading size="2xl" fontFamily="Tickerbit">
            {entry.title}
          </Heading>
          {/* <Text fontSize="xl" color="gray.500">
            {entry.shortDescription}
          </Text> */}
          <StyledProse>
            <MDXRemote {...content} />
          </StyledProse>
        </Stack>
      </GridItem>

      {/* Attributes: Occupy right column */}
      <GridItem
        colSpan={{ base: 1, md: 2 }}
        colStart={{ base: 1, md: 5 }}
        rowSpan={{ base: 1, md: 2 }}
      >
        <Center h="full">
          <MotionBox
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            zIndex={1}
          >
            <Stack
              gap={6}
              bg={{ base: "blackAlpha.400", md: "blackAlpha.700" }}
              p={8}
              borderRadius="lg"
              border="1px"
              borderColor={"cyan.700"}
              boxShadow="0 0 25px rgba(0, 200, 255, 0.20)"
              backdropFilter="blur(10px)"
            >
              <MotionBox variants={itemVariants}>
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  mb={3}
                  textTransform="uppercase"
                  letterSpacing="wider"
                  color="cyan.300"
                >
                  Category
                </Text>
                <HStack gap={3} flexWrap="wrap">
                  {entry.categories.map((category) => (
                    <Tag.Root
                      key={category}
                      size="md"
                      bg="blackAlpha.600"
                      color="cyan.100"
                      borderWidth="1px"
                      borderColor="cyan.700"
                      _hover={{ bg: "cyan.900", transform: "translateY(-2px)" }}
                      transition="all 0.2s"
                      p={2}
                    >
                      {category}
                    </Tag.Root>
                  ))}
                </HStack>
              </MotionBox>

              {entry.techStack && (
                <MotionBox variants={itemVariants}>
                  <Text
                    fontSize="xl"
                    fontWeight="bold"
                    mb={3}
                    textTransform="uppercase"
                    letterSpacing="wider"
                    color="cyan.300"
                  >
                    Tech Stack
                  </Text>
                  <Wrap gap={3}>
                    {entry.techStack.map((tech) => (
                      <WrapItem key={tech}>
                        <Tag.Root
                          size="md"
                          variant="subtle"
                          bg="blackAlpha.600"
                          color="cyan.100"
                          borderWidth="1px"
                          borderColor="cyan.700"
                          p={2}
                          _hover={{
                            bg: "cyan.900",
                            transform: "translateY(-2px)",
                          }}
                          transition="all 0.2s"
                        >
                          {tech}
                        </Tag.Root>
                      </WrapItem>
                    ))}
                  </Wrap>
                </MotionBox>
              )}

              {(entry.link || entry.github) && (
                <MotionBox variants={itemVariants}>
                  <Text
                    fontSize="xl"
                    fontWeight="bold"
                    mb={3}
                    textTransform="uppercase"
                    letterSpacing="wider"
                    color="cyan.300"
                  >
                    Links
                  </Text>
                  <HStack gap={4}>
                    {entry.link && (
                      <Button
                        asChild
                        rel="noopener noreferrer"
                        size="lg"
                        bg="cyan.600"
                        color="white"
                        _hover={{
                          bg: "cyan.500",
                          transform: "translateY(-2px)",
                        }}
                        boxShadow="0 0 15px rgba(0, 200, 255, 0.3)"
                        transition="all 0.2s"
                      >
                        <NextLink target="_blank" href={entry.link}>
                          <Icon as={VscBrowser} boxSize={5} mr={2} />
                          Visit Project
                        </NextLink>
                      </Button>
                    )}
                    {entry.github && (
                      <Button
                        asChild
                        rel="noopener noreferrer"
                        variant="outline"
                        size="lg"
                        borderColor="cyan.600"
                        color="cyan.100"
                        _hover={{
                          bg: "blackAlpha.400",
                          borderColor: "cyan.400",
                          transform: "translateY(-2px)",
                        }}
                        transition="all 0.2s"
                      >
                        <NextLink href={entry.github} target="_blank">
                          <Icon as={VscGithub} boxSize={5} mr={2} />
                          View Source
                        </NextLink>
                      </Button>
                    )}
                  </HStack>
                </MotionBox>
              )}
            </Stack>
          </MotionBox>
        </Center>
      </GridItem>
    </Grid>
  );
}
