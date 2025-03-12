import {
  Card,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  Tag,
} from "@chakra-ui/react";
import { PostMetaData } from "@/types/posts";
import { Link } from "@/components/ui/link";

interface PostCardGridProps {
  posts: PostMetaData[];
}

export const PostCardGrid = ({ posts }: PostCardGridProps) => {
  return (
    <SimpleGrid
      columns={{ base: 1, md: 2, lg: 3 }}
      gap={{ base: "12", lg: "8" }}
    >
      {posts.map((post) => (
        <Link href={`/posts/${post.slug}`} key={post.slug}>
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
                {post.categories?.length > 0 && (
                  <Stack direction="row" gap={2}>
                    {post.categories.map((category) => (
                      <Tag.Root
                        key={category}
                        variant="subtle"
                        colorScheme="teal"
                        color="cyan.600"
                      >
                        {category}
                      </Tag.Root>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Card.Footer>
          </Card.Root>
        </Link>
      ))}
    </SimpleGrid>
  );
};
