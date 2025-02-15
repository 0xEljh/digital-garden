import {
  Box,
  Container,
  Heading,
  Stack,
  Text,
  Button,
  Tag,
  HStack,
  Link as ChakraLink,
  Icon,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { GetStaticPaths, GetStaticProps } from "next";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { loadPortfolioEntries } from "@/lib/utils/portfolio";
import { PortfolioEntry } from "@/types/portfolio";
import { getIconComponent } from "@/lib/utils/portfolio-icons";
import { VscBrowser, VscGithub } from "react-icons/vsc";

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

export default function ProjectPage({ entry, content }: ProjectPageProps) {
  const IconComponent = getIconComponent(entry.icon);

  return (
    <Box py={{ base: 8, md: 12 }}>
      <Container maxW="container.lg">
        <Stack gap={8}>
          <Stack
            direction={{ base: "column", md: "row" }}
            gap={6}
            align="center"
          >
            <Box>
              <IconComponent
                boxSize={16}
                highlightColor={"yellow.500"}
                isHighlighted={true}
              />
            </Box>
            <Stack flex={1} gap={4}>
              <Heading size="2xl" fontFamily="Topoline">
                {entry.title}
              </Heading>
              <Text fontSize="xl" color="gray.500">
                {entry.shortDescription}
              </Text>
              <HStack gap={4} flexWrap="wrap">
                {entry.categories.map((category) => (
                  <Tag.Root key={category} size="md">
                    {category}
                  </Tag.Root>
                ))}
              </HStack>
            </Stack>
          </Stack>

          <HStack gap={4}>
            {entry.link && (
              <Button asChild rel="noopener noreferrer" size="lg">
                <NextLink target="_blank" href={entry.link}>
                  <Icon as={VscBrowser} boxSize={5} />
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
              >
                <NextLink href={entry.github} target="_blank">
                  <Icon as={VscGithub} boxSize={5} />
                  View Source
                </NextLink>
              </Button>
            )}
          </HStack>

          {entry.techStack && (
            <Box>
              <Text fontWeight="bold" mb={2}>
                Tech Stack
              </Text>
              <HStack gap={2} flexWrap="wrap">
                {entry.techStack.map((tech) => (
                  <Tag.Root key={tech} size="sm" variant="subtle">
                    {tech}
                  </Tag.Root>
                ))}
              </HStack>
            </Box>
          )}

          <Box
            bg={"gray.200"}
            p={8}
            borderRadius="lg"
            border="1px"
            borderColor={"gray.200"}
          >
            <MDXRemote {...content} />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
