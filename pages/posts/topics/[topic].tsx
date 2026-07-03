import { Box, Container, Heading, Stack, Text } from "@chakra-ui/react";
import type { GetStaticPaths, GetStaticProps } from "next";
import { useEffect } from "react";
import type { PostMetaData } from "@/types/posts";
import { loadPostsMetadata } from "@/lib/utils/posts";
import { labelForCategory, slugifyCategory } from "@/lib/content/categories";
import { PostList } from "@/components/log/post-list";
import { useAnalytics } from "@/components/common/analytics-provider";
import type { HeadMetaProps } from "@/types/head-meta";

interface TopicPageProps {
  topic: string;
  label: string;
  posts: PostMetaData[];
  headMeta?: HeadMetaProps;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await loadPostsMetadata();
  const slugs = new Set<string>();
  for (const post of posts) {
    for (const category of post.categories) slugs.add(slugifyCategory(category));
  }

  return {
    paths: Array.from(slugs).map((topic) => ({ params: { topic } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<TopicPageProps> = async ({
  params,
}) => {
  const topic = String(params?.topic ?? "");
  const all = await loadPostsMetadata();
  const posts = all.filter((post) =>
    post.categories.some((category) => slugifyCategory(category) === topic)
  );

  if (posts.length === 0) {
    return { notFound: true };
  }

  // Derive the canonical display label from a matching category.
  let label = topic;
  for (const post of posts) {
    const match = post.categories.find((c) => slugifyCategory(c) === topic);
    if (match) {
      label = labelForCategory(match);
      break;
    }
  }

  return {
    props: {
      topic,
      label,
      posts,
      headMeta: {
        title: `${label} · log`,
        description: `Entries in the log tagged ${label}.`,
      },
    },
  };
};

export default function TopicPage({ label, posts }: TopicPageProps) {
  const posthog = useAnalytics();

  useEffect(() => {
    posthog?.capture("view_topic", { topic: label, count: posts.length });
  }, [posthog, label, posts.length]);

  return (
    <Box py={{ base: 8, md: 12 }}>
      <Container maxW="container.lg">
        <Stack gap={8}>
          <Stack gap={2}>
            <Text
              fontFamily="mono"
              fontSize="sm"
              color="text.meta"
            >
              topic
            </Text>
            <Heading size="2xl" fontFamily="heading">
              {label}
            </Heading>
            <Text
              fontFamily="mono"
              fontSize="sm"
              color="text.meta"
            >
              {posts.length} {posts.length === 1 ? "entry" : "entries"}
            </Text>
          </Stack>
          <PostList posts={posts} source={`topic:${label}`} />
        </Stack>
      </Container>
    </Box>
  );
}
