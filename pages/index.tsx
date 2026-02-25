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
import type { AnalyticsData } from "@/types/analytics";
import { SocialBar } from "@/components/common/social-bar";
import { PortfolioPreview } from "@/components/portfolio/portfolio-preview";
import { DashboardPreview } from "@/components/dashboard/dashboard-preview";
import { ReactElement, useEffect, useState, useMemo } from "react";
import { useAnalytics } from "@/components/common/analytics-provider";
import { CategoryTags } from "@/components/garden/category-tag";

type SortMode = "recent" | "popular";

const HeroSection = ({
  analyticsData,
}: {
  analyticsData: AnalyticsData | null;
}) => {
  const precomputedAscii = HERO_ASCII.widths["300"];

  return (
    <Stack p={4} alignItems="center" gap={6}>
      <Stack alignItems="center">
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
      <DashboardPreview analyticsData={analyticsData} />
    </Stack>
  );
};

const DigitalGarden = ({ posts }: { posts: PostMetaData[] }) => {
  const posthog = useAnalytics();
  const [sortMode, setSortMode] = useState<SortMode>("recent");

  const sortedPosts = useMemo(() => {
    if (sortMode === "popular") {
      // Stub: popularity sort not yet implemented (needs page view tracking).
      // Falls back to recency for now.
      return posts;
    }
    return posts;
  }, [posts, sortMode]);

  return (
    <Stack gap={4} align="left">
      <HStack justify="space-between" align="baseline">
        <Heading size="md" fontFamily="Topoline" fontWeight="100">
          Digital Garden
        </Heading>
        <HStack gap={1}>
          {(["recent", "popular"] as const).map((mode) => (
            <Box
              key={mode}
              as="button"
              px={2}
              py={0.5}
              fontSize="xs"
              fontFamily="Aeion Mono"
              borderRadius="sm"
              cursor={mode === "popular" ? "not-allowed" : "pointer"}
              transition="all 0.2s"
              bg={sortMode === mode ? "cyan.900" : "transparent"}
              color={
                mode === "popular"
                  ? "gray.700"
                  : sortMode === mode
                    ? "cyan.100"
                    : "fg.muted"
              }
              borderWidth="1px"
              borderColor={sortMode === mode ? "cyan.700" : "gray.800"}
              _hover={
                mode === "popular"
                  ? {}
                  : { borderColor: "cyan.600", color: "cyan.200" }
              }
              onClick={() => {
                if (mode !== "popular") setSortMode(mode);
              }}
              title={
                mode === "popular"
                  ? "Coming soon — needs page view tracking"
                  : undefined
              }
            >
              {mode}
            </Box>
          ))}
        </HStack>
      </HStack>

      <Stack gap={0}>
        {sortedPosts.map((post, i) => (
          <Box
            key={post.slug}
            asChild
            _hover={{
              transform: "translateX(-3px)",
              bg: "gray.800/30",
            }}
            transition="all 0.2s"
            borderBottom={i < sortedPosts.length - 1 ? "1px solid" : "none"}
            borderColor="gray.800"
            py={3}
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
              <Stack gap={1}>
                <Text
                  fontSize="md"
                  fontWeight="medium"
                  fontFamily="Tickerbit"
                  color="fg"
                  lineClamp={1}
                >
                  {post.title}
                </Text>
                {post.excerpt && (
                  <Text
                    fontSize="sm"
                    color="fg.muted"
                    lineClamp={2}
                  >
                    {post.excerpt}
                  </Text>
                )}
                <HStack fontSize="xs" color="gray.600" gap={2} flexWrap="wrap">
                  <Text>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                  <Text>·</Text>
                  <Text>{post.readTime} min</Text>
                  {post.categories.length > 0 && (
                    <>
                      <Text>·</Text>
                      <CategoryTags categories={post.categories} />
                    </>
                  )}
                </HStack>
              </Stack>
            </Link>
          </Box>
        ))}
      </Stack>
      <Button
        asChild
        colorScheme="teal"
        variant="outline"
        size="sm"
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
  analyticsData: AnalyticsData | null;
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const entries = await loadPortfolioEntriesMetadata();
  const latestEntries = entries.slice(0, 3); // Show first 3 projects
  const posts = await loadPostsMetadata();
  const latestPosts = posts.slice(0, 5);

  // Load analytics data for dashboard preview
  let analyticsData: AnalyticsData | null = null;
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const dataDir = path.join(process.cwd(), "data");
    const files = await fs.readdir(dataDir);

    const analyticsFiles = files.filter(
      (f: string) =>
        f === "aw_analytics.json" || f.match(/^\d{6}_aw_analytics\.json$/)
    );

    if (analyticsFiles.length > 0) {
      const datedFiles = analyticsFiles
        .filter((f: string) => f.match(/^\d{6}_aw_analytics\.json$/))
        .sort()
        .reverse();
      const latestFile =
        datedFiles.length > 0 ? datedFiles[0] : analyticsFiles[0];
      const filePath = path.join(dataDir, latestFile);
      const content = await fs.readFile(filePath, "utf8");
      analyticsData = JSON.parse(content) as AnalyticsData;
    }
  } catch {
    // Analytics data is optional — fail silently
  }

  return {
    props: {
      latestEntries,
      latestPosts,
      analyticsData,
    },
  };
};

export default function Home({
  latestEntries,
  latestPosts,
  analyticsData,
}: HomeProps) {
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
            <HeroSection analyticsData={analyticsData} />
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
