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
import type { Post, PostMetaData } from "@/types/posts";
import { PostCardGrid } from "@/components/garden/post-card-grid";
import { StyledProse } from "@/components/common/styled-prose";
import "katex/dist/katex.min.css";
import { useEffect } from "react";
import posthog from 'posthog-js';

interface PostPageProps {
  post: Post;
  relatedPosts: PostMetaData[];
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
  
  // get related posts, but only send the metadata
  const relatedPosts = posts.filter((p) => post?.relatedPosts.includes(p.slug)).map(
    (p) => ({
      title: p.title,
      slug: p.slug,
      categories: p.categories,
      date: p.date,
      relatedPosts: p.relatedPosts,
      readTime: p.readTime,
    })
  );

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
      relatedPosts: relatedPosts,
    },
  };
};

export default function PostPage({ post, relatedPosts }: PostPageProps) {
  useEffect(() => {
    posthog.capture('view_post', {
      post_title: post.title,
      post_slug: post.slug,
      categories: post.categories,
    });
  }, [post]);

  return (
    <Box py={{ base: 8, md: 12 }}>
      <Container maxW="container.lg" px={{ base: 4, md: 12, lg: 24 }}>
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
              })} · {post.readTime} min read
            </Text>
          </Stack>
          <StyledProse fontWeight="30">
            <MDXRemote {...post.content} />
          </StyledProse>

          {relatedPosts && relatedPosts.length > 0 && (
            <Stack gap={{base: 4, md: 6}} py={{base: 8, md: 12}}>
              <Heading size="2xl" fontFamily="Topoline">
                Related Posts
              </Heading>
              <PostCardGrid posts={relatedPosts} />
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
