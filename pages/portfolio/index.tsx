import {
  Box,
  Container,
  Grid,
  Heading,
  Stack,
  GridItem,
} from "@chakra-ui/react";
import { GetStaticProps } from "next";
import { PortfolioCard } from "@/components/PortfolioCard";
import { loadPortfolioEntries } from "@/lib/utils/portfolio";
import { PortfolioEntry } from "@/types/portfolio";

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
  return (
    <Box py={{ base: 8, md: 12 }}>
      <Container maxW="container.xl">
        <Stack spacing={8}>
          <Heading size="2xl" fontFamily="Topoline">
            Portfolio
          </Heading>
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
                colSpan={{ base: 1, md: entry.size }}
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
