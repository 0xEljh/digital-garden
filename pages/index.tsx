import {
  Button,
  Container,
  Stack,
  Text,
  Box,
  Grid,
  Heading,
  HStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { Link } from "@/components/ui/link";
import { GetStaticProps } from "next";
import { HERO_ASCII } from "@/components/common/ascii-assets";
import { HydratedFlickeringAsciiImage } from "@/components/common";
import { loadPortfolioEntriesMetadata } from "@/lib/utils/portfolio";
import { loadPostsMetadata } from "@/lib/utils/posts";
import type { PortfolioEntry } from "@/types/portfolio";
import type { PostMetaData } from "@/types/posts";
import { SocialBar } from "@/components/common/social-bar";
import { PortfolioPreview } from "@/components/portfolio/portfolio-preview";
import { ReactElement, useEffect } from "react";
import { useAnalytics } from "@/components/common/analytics-provider";
import { CategoryTags } from "@/components/garden/category-tag";

const HeroSection = () => {
  const precomputedAscii = HERO_ASCII.widths["300"];

  return (
    <Stack p={4} alignItems="center">
      <Link href={`/dashboard`}>
        <HydratedFlickeringAsciiImage
          imagePath="/emiya_kiritsugu-small.png"
          width={300}
          sampleFactor={12}
          fontSize="2px"
          precomputedAscii={precomputedAscii}
          scrambleOnHydrate
          scrambleSpeedMs={14}
          scrambleIterations={14}
        />
      </Link>
      <Text
        fontSize={{ base: "lg", md: "xl" }}
        color="fg.muted"
        maxW={"md"}
        fontFamily="Tickerbit"
        fontWeight="100"
      >
        The digital garden of a full-stack (btw) machine learning engineer.
      </Text>
      <SocialBar />
    </Stack>
  );
};

const DigitalGarden = ({ posts }: { posts: PostMetaData[] }) => {
  const posthog = useAnalytics();

  return (
    <Stack gap={6} align="left">
      <Heading size="md" fontFamily="Topoline" fontWeight="100">
        Digital Garden
      </Heading>
      <Stack gap={8}>
        {posts.map((post) => (
          <Box
            key={post.slug}
            asChild
            _hover={{
              transform: "scale(1.01) translateX(-5px)",
            }}
            transition="all 0.2s"
          >
            <Link
              href={`/posts/${post.slug}`}
              onClick={() => {
                posthog?.capture("post_click", {
                  post_title: post.title,
                  post_slug: post.slug,
                  categories: post.categories,
                  location: "/",
                });
              }}
            >
              <Stack gap={2}>
                <Text
                  fontSize="xl"
                  fontWeight="medium"
                  fontFamily="Tickerbit"
                  color="fg"
                >
                  {post.title}
                </Text>
                <HStack fontSize="xs" color="gray.700" gap={2}>
                  <Text>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                  <Text>·</Text>
                  <Text>{post.readTime} min read</Text>
                </HStack>
                <CategoryTags categories={post.categories} />
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
        onClick={() => {
          posthog?.capture("explore_garden_click", {
            location: "/",
          });
        }}
      >
        <NextLink href="/posts">Explore Garden</NextLink>
      </Button>
    </Stack>
  );
};

interface HomeProps {
  latestEntries: PortfolioEntry[];
  latestPosts: PostMetaData[];
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const entries = await loadPortfolioEntriesMetadata();
  const latestEntries = entries.slice(0, 3); // Show first 3 projects
  const posts = await loadPostsMetadata();
  const latestPosts = posts.slice(0, 3);

  return {
    props: {
      latestEntries: latestEntries,
      latestPosts: latestPosts,
    },
  };
};

export default function Home({ latestEntries, latestPosts }: HomeProps) {
  const posthog = useAnalytics();

  useEffect(() => {
    posthog?.capture("view_homepage");
  }, [posthog]);

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
