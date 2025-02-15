import {
  Button,
  Container,
  Stack,
  Text,
  Box,
  useBreakpointValue,
  Grid,
  Tag,
  Heading,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { Link } from "@/components/ui/link";
import { GetStaticProps } from "next";
import { QuoteBlock } from "@/components/common/QuoteBlock";
import { ImageToAscii } from "@/components/common/AsciiImage";
import { loadPortfolioEntries } from "@/lib/utils/portfolio";
import { loadPosts } from "@/lib/utils/posts";
import type { PortfolioEntry } from "@/types/portfolio";
import type { Post } from "@/types/posts"; // Add this line to import the Post type
import { SocialBar } from "@/components/common/SocialBar";
import { PortfolioPreview } from "@/components/portfolio/PortfolioPreview";
import { ReactElement } from "react";

const HeroSection = () => (
  <Stack p={4} alignItems="center">
    <ImageToAscii
      imagePath="/emiya_kiritsugu.png"
      width={300}
      sampleFactor={12}
      fontSize="2px"
    />
    <Text
      fontSize={{ base: "lg", md: "2xl" }}
      color="fg.muted"
      maxW={"md"}
      fontFamily="Topoline"
      fontWeight="100"
    >
      The digital garden of a full-stack deep learning engineer, trying to find
      his way in the startup world.
    </Text>
    <SocialBar />
    <Stack direction={{ base: "column", sm: "row" }} gap={4}>
      <QuoteBlock colorScheme="teal" dark={true}>
        Keeping one foot in order so I can dance with the chaos.
      </QuoteBlock>
    </Stack>
  </Stack>
);

const DigitalGarden = ({ posts }: { posts: Post[] }) => {
  const linkHoverStyle = useBreakpointValue({
    base: { textDecoration: "none" },
    md: { textDecoration: "none", transform: "scale(1.02)" },
  });

  return (
    <Box as="section" py={8}>
      <Stack gap={6}>
        <Heading size="xs" fontFamily="Topoline">
          Digital Garden
        </Heading>
        <Stack gap={8}>
          {posts.map((post) => (
            <Box key={post.slug}>
              <Link
                _hover={linkHoverStyle}
                transition="all 0.2s"
                href={`/posts/${post.slug}`}
              >
                <Stack gap={2}>
                  <Text fontSize="xl" fontWeight="medium">
                    {post.title}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                  {post.categories?.length > 0 && (
                    <Stack direction="row" gap={2}>
                      {post.categories.map((category) => (
                        <Tag.Root
                          key={category}
                          variant="subtle"
                          colorScheme="teal"
                        >
                          {category}
                        </Tag.Root>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Link>
            </Box>
          ))}
        </Stack>
        <Button
          asChild
          colorScheme="teal"
          variant="outline"
          size="md"
          alignSelf="center"
          fontWeight="400"
        >
          <NextLink href="/posts">View all posts</NextLink>
        </Button>
      </Stack>
    </Box>
  );
};

interface HomeProps {
  latestEntries: PortfolioEntry[];
  latestPosts: Post[];
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const entries = await loadPortfolioEntries();
  const latestEntries = entries.slice(0, 3); // Show first 3 projects
  const posts = await loadPosts();
  const latestPosts = posts.slice(0, 3);

  return {
    props: {
      latestEntries: latestEntries,
      latestPosts: latestPosts,
    },
  };
};

export default function Home({ latestEntries, latestPosts }: HomeProps) {
  return (
    <Box py={{ base: 8, md: 12 }}>
      <Container maxW="container.xl">
        <Stack gap={{ base: 12, md: 24 }}>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={12}>
            <PortfolioPreview entries={latestEntries} />
            <HeroSection />
            <DigitalGarden posts={latestPosts} />
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return page; // no layout for this page for now
};
