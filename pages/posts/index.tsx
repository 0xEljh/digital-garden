import {
  Box,
  Container,
  Heading,
  Stack,
  Text,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import NextLink from "next/link";
import type { GetStaticProps } from "next";
import type { PostMetaData } from "@/types/posts";
import { loadPostsMetadata } from "@/lib/utils/posts";
import { useEffect } from "react";
import { useAnalytics } from "@/components/common/analytics-provider";
import { CategoryTags } from "@/components/garden/category-tag";

interface PageProps {
  posts: PostMetaData[];
}

export default function PostsIndexPage({ posts }: PageProps) {
  const posthog = useAnalytics();

  useEffect(() => {
    posthog?.capture("view_blog_index");
  }, [posthog]);

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
                _hover={{ bg: "gray.900", transform: "rotate(0.5deg)" }}
                transition="background 0.2s"
              >
                <Stack gap={3}>
                  <Heading size="lg" fontFamily="Tickerbit">
                    <LinkOverlay
                      as={NextLink}
                      href={`/posts/${post.slug}`}
                      onClick={() => {
                        posthog?.capture("post_click", {
                          post_title: post.title,
                          post_slug: post.slug,
                          categories: post.categories,
                          location: "posts/",
                        });
                      }}
                    >
                      {post.title}
                    </LinkOverlay>
                  </Heading>
                  <CategoryTags categories={post.categories} />
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
  // Posts are already sorted by date descending from the loader
  const posts = await loadPostsMetadata();

  return {
    props: {
      posts,
    },
  };
};
