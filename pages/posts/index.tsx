import {
  Box,
  chakra,
  Container,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { GetStaticProps } from "next";
import { useRouter } from "next/router";
import type { PostMetaData } from "@/types/posts";
import { loadPostsMetadata } from "@/lib/utils/posts";
import { useEffect } from "react";
import { useAnalytics } from "@/components/common/analytics-provider";
import { PostList } from "@/components/log/post-list";
import { StarChart } from "@/components/chart/star-chart";

interface PageProps {
  posts: PostMetaData[];
}

type View = "list" | "chart";

function ViewToggle({
  view,
  onChange,
}: {
  view: View;
  onChange: (v: View) => void;
}) {
  return (
    <HStack
      gap={0}
      fontFamily="mono"
      fontSize="sm"
      borderWidth="1px"
      borderColor="edge.default"
      borderRadius="md"
      overflow="hidden"
      role="group"
      aria-label="View"
    >
      {(["list", "chart"] as View[]).map((v) => (
        <chakra.button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          px={3}
          py={1}
          bg={view === v ? "accent.subtle" : "transparent"}
          color={view === v ? "accent.emphasized" : "text.meta"}
          _hover={{ color: view === v ? "accent.emphasized" : "text.body" }}
          aria-pressed={view === v}
          cursor="pointer"
          transition="color 0.15s ease, background 0.15s ease"
        >
          {v}
        </chakra.button>
      ))}
    </HStack>
  );
}

export default function PostsIndexPage({ posts }: PageProps) {
  const posthog = useAnalytics();
  const router = useRouter();
  const view: View = router.query.view === "chart" ? "chart" : "list";

  useEffect(() => {
    posthog?.capture("view_blog_index");
  }, [posthog]);

  const setView = (next: View) => {
    posthog?.capture?.("chart_view_toggle", { view: next });
    const query = { ...router.query };
    if (next === "chart") query.view = "chart";
    else delete query.view;
    // shallow: URL only — both views share the same static props.
    router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
    });
  };

  return (
    <Box py={{ base: 8, md: 12 }}>
      <Container maxW="container.lg">
        <Stack gap={8}>
          <Stack gap={3}>
            <Flex justify="space-between" align="center" gap={4} wrap="wrap">
              <Heading size="2xl" fontFamily="display">
                log
              </Heading>
              <ViewToggle view={view} onChange={setView} />
            </Flex>
            <Text color="text.meta" fontSize="sm" maxW="68ch" lineHeight={1.7}>
              An expedition log — most entries are sighted or charted; a few are
              mapped. Version-controlled and kept in the open, so each shows when
              it was logged and last updated.
            </Text>
          </Stack>
          {view === "chart" ? (
            <StarChart posts={posts} />
          ) : (
            <PostList posts={posts} source="posts/" />
          )}
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
