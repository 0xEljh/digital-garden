import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Flex,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { GetStaticPaths, GetStaticProps } from "next";
import { MDXRemote } from "next-mdx-remote";
import { loadPosts } from "@/lib/utils/posts";
import type { Post, PostMetaData } from "@/types/posts";
import { PostCardGrid } from "@/components/garden/post-card-grid";
import { StyledProse } from "@/components/common/styled-prose";
import { SocialBar } from "@/components/common/social-bar";
import "katex/dist/katex.min.css";
import { useEffect } from "react";
import posthog from "posthog-js";
import Head from "next/head";
import { LuArrowRight } from "react-icons/lu";
import type { HeadMetaProps } from "@/types/head-meta";
import { CategoryTags } from "@/components/garden/category-tag";

interface PostPageProps {
  post: Post;
  relatedPosts: PostMetaData[];
  headMeta?: HeadMetaProps;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await loadPosts();

  // Only generate paths for valid post slugs
  const paths = posts
    .filter((post) => post.slug && post.slug.trim() !== "")
    .map((post) => ({
      params: { post: post.slug },
    }));

  return {
    paths,
    // Set fallback to 'blocking' to handle potentially valid paths
    // that weren't generated at build time
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<PostPageProps> = async ({
  params,
}) => {
  const posts = await loadPosts();
  const post = posts.find((p) => p.slug === params?.post);

  // get related posts, but only send the metadata
  const relatedPostsData = posts
    .filter((p) => post?.relatedPosts.includes(p.slug))
    .map((p) => ({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      categories: p.categories,
      date: p.date,
      relatedPosts: [],
      readTime: p.readTime,
    }));

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
      relatedPosts: relatedPostsData,
      headMeta: {
        title: post.title,
        description: post.excerpt,
      },
    },
  };
};

export default function PostPage({ post, relatedPosts }: PostPageProps) {
  useEffect(() => {
    posthog.capture("view_post", {
      post_title: post.title,
      post_slug: post.slug,
      categories: post.categories,
    });
  }, [post]);

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    dateModified: post.date,
    author: [
      {
        "@type": "Person",
        name: "Elijah",
      },
    ],
    keywords: post.categories,
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <Box py={{ base: 8, md: 12 }}>
        <Container maxW="container.lg" px={{ base: 4, md: 12, lg: 24 }}>
          <Stack gap={8}>
            <Stack gap={4}>
              <Heading size="2xl" fontFamily="Tickerbit">
                {post.title}
              </Heading>
              <CategoryTags categories={post.categories} />
              <Text color="gray.600" fontFamily={"Aeion Mono"}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                · {post.readTime} min read
              </Text>
            </Stack>
            <StyledProse>
              <MDXRemote {...post.content} />
            </StyledProse>

            <SocialBar />

            {relatedPosts && relatedPosts.length > 0 && (
              <Stack gap={{ base: 4, md: 6 }} py={{ base: 8, md: 12 }}>
                <Flex direction="row" justify="space-between">
                  <Heading size="2xl" fontFamily="Topoline">
                    Related Posts
                  </Heading>
                  <Button
                    display={{ base: "none", md: "flex" }}
                    variant="ghost"
                    asChild
                  >
                    <NextLink href="/posts">
                      Revisit Garden <LuArrowRight />
                    </NextLink>
                  </Button>
                </Flex>
                <PostCardGrid posts={relatedPosts} />
                <Button
                  display={{ base: "flex", md: "none" }}
                  variant="ghost"
                  asChild
                >
                  <NextLink href="/posts">
                    Revisit Garden <LuArrowRight />
                  </NextLink>
                </Button>
              </Stack>
            )}
          </Stack>
        </Container>
      </Box>
    </>
  );
}
