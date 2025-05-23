import {
  Box,
  Container,
  Grid,
  Heading,
  Stack,
  Flex,
  Button,
  GridItem,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { GetStaticProps } from "next";
import { PortfolioCard } from "@/components/portfolio/portfolio-card";
import { loadPortfolioEntries } from "@/lib/utils/portfolio";
import { PortfolioEntry } from "@/types/portfolio";
import { useRouter } from "next/router";
import posthog from "posthog-js";
import { LuDownload } from "react-icons/lu";

interface PortfolioPageProps {
  entries: PortfolioEntry[];
}

export const getStaticProps: GetStaticProps<PortfolioPageProps> = async () => {
  const entries = await loadPortfolioEntries();

  return {
    props: {
      entries,
    },
  };
};

export default function PortfolioPage({ entries }: PortfolioPageProps) {
  const router = useRouter();
  return (
    <Box py={{ base: 8, md: 12 }}>
      <Container maxW="container.xl">
        <Stack gap={8}>
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
          >
            <Heading size="3xl" fontFamily="Topoline">
              Portfolio
            </Heading>
            <Button
              colorScheme="teal"
              variant="ghost"
              size="sm"
              alignSelf={{ base: "flex-start", md: "center" }}
              ml={{ base: 1, md: 0 }}
              mt={{ base: 4, md: 0 }}
              asChild
            >
              <NextLink
                href="/api/download-resume"
                onClick={() => {
                  posthog.capture("download_resume_click", {
                    location: router.asPath,
                  });
                }}
              >
                <LuDownload />
                Resume
              </NextLink>
            </Button>
          </Flex>
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={6}
            autoFlow="row dense"
            px={{ base: 0, md: 16 }}
          >
            {entries.map((entry, index) => (
              <GridItem
                key={entry.slug}
                // colSpan={{ base: 1, md: index % 2 === 0 ? 1 : entry.size }}
                // colSpan={{ base: 1, md: entry.size }}
                // rowSpan={index % 2 === 0 ? entry.size : 1}
              >
                <PortfolioCard entry={entry} />
              </GridItem>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
