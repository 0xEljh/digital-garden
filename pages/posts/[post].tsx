import {
  Box,
  Container,
  Heading,
  Stack,
  Text,
  Tag,
  HStack,
} from "@chakra-ui/react";
import { GetStaticPaths, GetStaticProps } from "next";
import { MDXRemote } from "next-mdx-remote";
import { loadPosts } from "@/lib/utils/posts";
import type { Post } from "@/types/posts";
import { StyledProse } from "@/components/common/StyledProse";
import "katex/dist/katex.min.css";

interface PostPageProps {
  post: Post;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await loadPosts();

  // Only generate paths for valid post slugs
  const paths = posts
    .filter(post => post.slug && post.slug.trim() !== '')
    .map((post) => ({
      params: { post: post.slug },
    }));

  return {
    paths,
    // Set fallback to 'blocking' to handle potentially valid paths
    // that weren't generated at build time
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<PostPageProps> = async ({
  params,
}) => {
  const posts = await loadPosts();
  const post = posts.find((p) => p.slug === params?.post);

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
  };
};

export default function PostPage({ post }: PostPageProps) {
  return (
    <Box py={{ base: 8, md: 12 }}>
      <Container maxW="container.lg">
        <Stack gap={8}>
          <Stack gap={4}>
            <Heading size="2xl" fontFamily="Topoline">
              {post.title}
            </Heading>
            <HStack gap={4} flexWrap="wrap">
              {post.categories.map((category) => (
                <Tag.Root key={category} size="md">
                  {category}
                </Tag.Root>
              ))}
            </HStack>
            <Text color="gray.700">
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </Stack>

          <StyledProse fontWeight="30">
            <MDXRemote {...post.content} />
          </StyledProse>

          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <Stack gap={4}>
              <Heading size="lg">Related Posts</Heading>
              <Stack>
                {post.relatedPosts.map((relatedPost) => (
                  <Text key={relatedPost.slug}>{relatedPost.title}</Text>
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
