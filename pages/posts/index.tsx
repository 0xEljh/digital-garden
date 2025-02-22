import {
  Box,
  Container,
  Heading,
  Stack,
  Text,
  Tag,
  HStack,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import NextLink from "next/link";
import type { GetStaticProps } from "next";
import type { Post } from "@/types/posts";
import { loadPosts } from "@/lib/utils/posts";

interface PageProps {
  posts: Post[];
}

export default function PostsIndexPage({ posts }: PageProps) {
  return (
    <Box py={{ base: 8, md: 12 }}>
      <Container maxW="container.lg">
        <Stack gap={8}>
          <Heading size="2xl" fontFamily="Topoline">
            Blog Posts
          </Heading>

          <Stack gap={6}>
            {posts.map((post) => (
              <LinkBox
                key={post.slug}
                as="article"
                p={6}
                borderWidth="1px"
                borderRadius="lg"
                _hover={{ bg: "gray.50" }}
                transition="background 0.2s"
              >
                <Stack gap={3}>
                  <Heading size="lg">
                    <LinkOverlay as={NextLink} href={`/posts/${post.slug}`}>
                      {post.title}
                    </LinkOverlay>
                  </Heading>
                  <HStack gap={4} flexWrap="wrap">
                    {post.categories.map((category) => (
                      <Tag.Root key={category} size="md">
                        {category}
                      </Tag.Root>
                    ))}
                  </HStack>
                  <Text color="gray.500">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                </Stack>
              </LinkBox>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const posts = await loadPosts();

  // Sort posts by date, most recent first
  const sortedPosts = posts.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  return {
    props: {
      posts: sortedPosts,
    },
  };
};
