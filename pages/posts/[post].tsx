import { Box, Container, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { GetStaticPaths, GetStaticProps } from "next";
import { MDXRemote } from "next-mdx-remote";
import { loadPosts } from "@/lib/utils/posts";
import type { Post } from "@/types/posts";
import {
  deriveRelated,
  type RelatedCandidate,
  type RelatedReason,
} from "@/lib/content/related";
import { StyledProse, mdxComponents } from "@/components/common/styled-prose";
import { SocialBar } from "@/components/common/social-bar";
import "katex/dist/katex.min.css";
import { useEffect } from "react";
import { useAnalytics } from "@/components/common/analytics-provider";
import Head from "next/head";
import type { HeadMetaProps } from "@/types/head-meta";
import { CategoryTags } from "@/components/log/category-tag";
import { EntryMeta } from "@/components/log/entry-meta";
import { StageNote } from "@/components/log/stage-badge";
import { EntryLink } from "@/components/log/entry-link";

interface RelatedRow {
  slug: string;
  title: string;
  reason: RelatedReason;
  sharedCategory: string | null;
}

interface PostPageProps {
  post: Post;
  related: RelatedRow[];
  backlinks: { slug: string; title: string }[];
  headMeta?: HeadMetaProps;
}

/** The muted right-hand note on a Related/Nearby row — names the dominant signal. */
function reasonLabel(r: {
  reason: RelatedReason;
  sharedCategory: string | null;
}): string {
  if (r.reason === "related") return "related";
  if (r.reason === "linked") return "links here";
  return r.sharedCategory ? `shared · ${r.sharedCategory}` : "shared";
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
    // 'blocking' handles potentially valid paths not generated at build time
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<PostPageProps> = async ({
  params,
}) => {
  const posts = await loadPosts();
  const post = posts.find((p) => p.slug === params?.post);

  if (!post) {
    return { notFound: true };
  }

  // Graph-derived neighbors: outbound edges (manual relatedPosts + inline
  // mentions) ∪ shared-category proximity, ranked (C6) — replaces the old
  // manual-relatedPosts-only filter so the link graph actually drives discovery.
  const candidates: RelatedCandidate[] = posts
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      categories: p.categories,
      date: p.date,
      stage: p.stage,
    }));
  const related: RelatedRow[] = deriveRelated(
    { slug: post.slug, categories: post.categories, outgoing: post.outgoing },
    candidates
  ).map((p) => ({
    slug: p.slug,
    title: p.title,
    reason: p.reason,
    sharedCategory: p.sharedCategory ?? null,
  }));

  // Inbound: who links here (the "Linked from" list).
  const titleBySlug = new Map(posts.map((p) => [p.slug, p.title]));
  const backlinks = post.backlinks
    .map((slug) => ({ slug, title: titleBySlug.get(slug) }))
    .filter((b): b is { slug: string; title: string } => Boolean(b.title));

  return {
    props: {
      post,
      related,
      backlinks,
      headMeta: {
        title: post.title,
        description: post.excerpt,
      },
    },
  };
};

export default function PostPage({ post, related, backlinks }: PostPageProps) {
  const posthog = useAnalytics();

  useEffect(() => {
    posthog?.capture?.("view_post", {
      post_title: post.title,
      post_slug: post.slug,
      categories: post.categories,
    });
  }, [post, posthog]);

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    dateModified: post.tended,
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
              <Heading size="2xl" fontFamily="heading">
                {post.title}
              </Heading>
              <CategoryTags categories={post.categories} linkify />
              <EntryMeta
                stage={post.stage}
                date={post.date}
                tended={post.tended}
                readTime={post.readTime}
                confidence={post.confidence}
              />
              <StageNote stage={post.stage} />
            </Stack>
            <StyledProse>
              <MDXRemote {...post.content} components={mdxComponents} />
            </StyledProse>

            <SocialBar />

            {(backlinks.length > 0 || related.length > 0) && (
              <Stack gap={6} pt={{ base: 2, md: 4 }}>
                {backlinks.length > 0 && (
                  <Stack gap={2}>
                    <Text fontFamily="mono" fontSize="sm" color="text.meta">
                      linked from
                    </Text>
                    <Stack gap={1} align="start">
                      {backlinks.map((b) => (
                        <EntryLink
                          key={b.slug}
                          href={`/posts/${b.slug}`}
                          fontFamily="mono"
                          fontSize="sm"
                        >
                          {b.title}
                        </EntryLink>
                      ))}
                    </Stack>
                  </Stack>
                )}

                {related.length > 0 && (
                  <Stack gap={2}>
                    <Text fontFamily="mono" fontSize="sm" color="text.meta">
                      related / nearby
                    </Text>
                    <Stack gap={1.5} align="start">
                      {related.map((r) => (
                        <HStack key={r.slug} gap={2} wrap="wrap">
                          <EntryLink
                            href={`/posts/${r.slug}`}
                            fontFamily="mono"
                            fontSize="sm"
                          >
                            {r.title}
                          </EntryLink>
                          <Text
                            as="span"
                            fontFamily="mono"
                            fontSize="xs"
                            color="text.meta"
                          >
                            {reasonLabel(r)}
                          </Text>
                        </HStack>
                      ))}
                    </Stack>
                  </Stack>
                )}
              </Stack>
            )}
          </Stack>
        </Container>
      </Box>
    </>
  );
}
