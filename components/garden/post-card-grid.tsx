import { Card, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { PostMetaData } from "@/types/posts";
import { Link } from "@/components/ui/link";
import { useAnalytics } from "@/components/common/analytics-provider";
import { CategoryTags } from "./category-tag";

interface PostCardGridProps {
  posts: PostMetaData[];
}

export const PostCardGrid = ({ posts }: PostCardGridProps) => {
  const posthog = useAnalytics();
  return (
    <SimpleGrid
      columns={{ base: 1, md: 2, lg: 3 }}
      gap={{ base: "12", lg: "8" }}
    >
      {posts.map((post) => (
        <Link
          href={`/posts/${post.slug}`}
          key={post.slug}
          onClick={() => {
            posthog?.capture("related_post_click", {
              post_title: post.title,
              post_slug: post.slug,
              categories: post.categories,
              read_time: post.readTime,
              source: "related_posts",
            });
          }}
        >
          <Card.Root as="article" size="lg" rounded="xl">
            <Card.Body gap="3">
              <Stack direction="row" gap={{ base: 6, md: 12 }}>
                <Text textStyle="sm" color="gray.600">
                  {post.readTime} min read
                </Text>
                <Text textStyle="sm" color="gray.600">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </Stack>
              <Heading as="h3" size="2xl" fontFamily="Tickerbit">
                {post.title}
              </Heading>
            </Card.Body>
            <Card.Footer>
              <Stack direction="row" gap={4}>
                <CategoryTags categories={post.categories} />
              </Stack>
            </Card.Footer>
          </Card.Root>
        </Link>
      ))}
    </SimpleGrid>
  );
};
