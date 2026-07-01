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
import { PostList } from "@/components/garden/post-list";
import { GardenPlot } from "@/components/garden/garden-plot";

interface PageProps {
  posts: PostMetaData[];
}

type View = "list" | "garden";

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
      {(["list", "garden"] as View[]).map((v) => (
        <chakra.button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          px={3}
          py={1}
          bg={view === v ? "accent.subtle" : "transparent"}
          color={view === v ? "accent.emphasized" : "gray.500"}
          _hover={{ color: view === v ? "accent.emphasized" : "gray.300" }}
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
  const view: View = router.query.view === "garden" ? "garden" : "list";

  useEffect(() => {
    posthog?.capture("view_blog_index");
  }, [posthog]);

  const setView = (next: View) => {
    posthog?.capture?.("garden_view_toggle", { view: next });
    const query = { ...router.query };
    if (next === "garden") query.view = "garden";
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
                The Garden
              </Heading>
              <ViewToggle view={view} onChange={setView} />
            </Flex>
            <Text color="gray.500" fontSize="sm" maxW="62ch" lineHeight={1.7}>
              Some of these are seedlings — just planted, still rough. A few have
              grown evergreen. All of them are version-controlled and grown in the
              open, so each shows when it was planted and last tended.
            </Text>
          </Stack>
          {view === "garden" ? (
            <GardenPlot posts={posts} />
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
