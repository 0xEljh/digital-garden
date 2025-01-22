import { Box, Container, Heading, Stack, Text, Button, Tag, HStack, Link as ChakraLink, useColorModeValue, Icon } from '@chakra-ui/react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { loadPortfolioEntries } from '@/lib/utils/portfolio';
import { PortfolioEntry } from '@/types/portfolio';
import { getIconComponent } from '@/lib/utils/portfolio-icons';
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

export const getStaticProps: GetStaticProps<ProjectPageProps> = async ({ params }) => {
  const entries = await loadPortfolioEntries();
  const entry = entries.find((e) => e.slug === params?.project);
  
  if (!entry) {
    return {
      notFound: true,
    };
  }

  const content = await serialize(entry.longDescription || '');
  
  return {
    props: {
      entry,
      content,
    },
  };
};

export default function ProjectPage({ entry, content }: ProjectPageProps) {
  const IconComponent = getIconComponent(entry.icon);
  const highlightColor = useColorModeValue('blue.500', 'blue.300');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box py={{ base: 8, md: 12 }}>
      <Container maxW="container.lg">
        <Stack spacing={8}>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={6} align="center">
            <Box>
              <IconComponent
                boxSize={16}
                highlightColor={highlightColor}
                isHighlighted={true}
              />
            </Box>
            <Stack flex={1} spacing={4}>
              <Heading size="2xl" fontFamily="Topoline">{entry.title}</Heading>
              <Text fontSize="xl" color="gray.500">
                {entry.shortDescription}
              </Text>
              <HStack spacing={4} flexWrap="wrap">
                {entry.categories.map((category) => (
                  <Tag key={category} size="md">
                    {category}
                  </Tag>
                ))}
              </HStack>
            </Stack>
          </Stack>

          <HStack spacing={4}>
            {entry.link && (
              <Button
                as="a"
                href={entry.link}
                target="_blank"
                rel="noopener noreferrer"
                leftIcon={<Icon as={VscBrowser}  boxSize={5} />}
                size="lg"
              >
                Visit Project
              </Button>
            )}
            {entry.github && (
              <Button
                as="a"
                href={entry.github}
                target="_blank"
                rel="noopener noreferrer"
                leftIcon={<Icon as={VscGithub} boxSize={5} />}
                variant="outline"
                size="lg"
              >
                View Source 
              </Button>
            )}
          </HStack>

          {entry.techStack && (
            <Box>
              <Text fontWeight="bold" mb={2}>Tech Stack</Text>
              <HStack spacing={2} flexWrap="wrap">
                {entry.techStack.map((tech) => (
                  <Tag key={tech} size="sm" variant="subtle">
                    {tech}
                  </Tag>
                ))}
              </HStack>
            </Box>
          )}

          <Box
            bg={bgColor}
            p={8}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
          >
            <MDXRemote {...content} />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
