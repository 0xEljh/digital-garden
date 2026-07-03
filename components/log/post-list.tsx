import { Heading, LinkBox, LinkOverlay, Stack } from "@chakra-ui/react";
import NextLink from "next/link";
import type { PostMetaData } from "@/types/posts";
import { useAnalytics } from "@/components/common/analytics-provider";
import { CategoryTags } from "./category-tag";
import { EntryMeta } from "./entry-meta";

interface PostListProps {
  posts: PostMetaData[];
  /** Analytics location label for post_click events. */
  source?: string;
}

/** Shared listing used by /posts and topic pages. */
export function PostList({ posts, source = "posts/" }: PostListProps) {
  const posthog = useAnalytics();
  return (
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
            <Heading size="lg" fontFamily="heading">
              <LinkOverlay
                as={NextLink}
                href={`/posts/${post.slug}`}
                onClick={() =>
                  posthog?.capture("post_click", {
                    post_title: post.title,
                    post_slug: post.slug,
                    categories: post.categories,
                    location: source,
                  })
                }
              >
                {post.title}
              </LinkOverlay>
            </Heading>
            <CategoryTags categories={post.categories} linkify />
            <EntryMeta
              compact
              stage={post.stage}
              date={post.date}
              tended={post.tended}
              readTime={post.readTime}
            />
          </Stack>
        </LinkBox>
      ))}
    </Stack>
  );
}
