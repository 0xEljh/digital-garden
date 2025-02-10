import {
  Button,
  Container,
  Heading,
  Stack,
  Text,
  Box,
  Flex,
  useBreakpointValue,
  SimpleGrid,
  Grid,
  Image,
  Link,
} from "@chakra-ui/react";
import { GetStaticProps } from "next";
import { QuoteBlock } from "@/components/QuoteBlock";
import { ImageToAscii } from "@/components/AsciiImage";
import { loadPortfolioEntries } from "@/lib/utils/portfolio";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { PortfolioEntry } from "@/types/portfolio";
import { FaDownload } from "react-icons/fa6";
import { SocialBar } from "@/components/SocialBar";
import { PortfolioPreview } from "@/components/portfolio/PortfolioPreview";

interface HomeProps {
  featuredEntries: PortfolioEntry[];
}

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
    <Stack direction={{ base: "column", sm: "row" }} spacing={4}>
      <QuoteBlock colorScheme="teal" dark={true}>
        Keeping one foot in order so I can dance with the chaos.
      </QuoteBlock>
    </Stack>
  </Stack>
);
// 2) Portfolio Teaser
// const PortfolioPreview = ({ entries }: { entries: PortfolioEntry[] }) => {
//   return (
//     <Box as="section" py={8}>
//       <Stack spacing={6}>
//         <Heading size="xs" fontFamily="Topoline">
//           Recent stuff
//         </Heading>
//         <Container overflow="scroll" maxH="150vw">
//           <SimpleGrid columns={1} spacing={6}>
//             {entries.map((entry) => (
//               <PortfolioCard key={entry.slug} entry={entry} />
//             ))}
//           </SimpleGrid>
//         </Container>
//         <Stack direction={{ base: "column-reverse", md: "row" }}>
//           <Button
//             leftIcon={<FaDownload />}
//             colorScheme="teal"
//             variant="outline"
//             size="md"
//             alignSelf="center"
//             as="a"
//             href="/api/download-resume"
//             fontWeight="40"
//           >
//             My Resume
//           </Button>
//           <Button
//             as="a"
//             href="/portfolio"
//             colorScheme="teal"
//             variant="outline"
//             size="md"
//             alignSelf="center"
//             fontWeight="40"
//           >
//             Full Portfolio
//           </Button>
//         </Stack>
//       </Stack>
//     </Box>
//   );
// };

// 3) Digital Garden
const DigitalGarden = () => {
  // Example articles data
  const articles = [
    {
      title: "Deep Learning Post 1",
      url: "/blog/deep-learning-1",
      thumbnail: "/images/dl-1.jpg",
    },
    {
      title: "Startup Reflections",
      url: "/blog/startup-reflections",
      thumbnail: "/images/startup-1.jpg",
    },
    {
      title: "Another Post Title",
      url: "/blog/another-post",
      thumbnail: "/images/post-3.jpg",
    },
  ];

  return (
    <Box as="section" p={6} h="full">
      <Stack spacing={4}>
        {articles.map((article) => (
          <Flex
            key={article.url}
            alignItems="center"
            bg="white"
            borderRadius="md"
            boxShadow="sm"
            overflow="hidden"
          >
            <Image
              src={article.thumbnail}
              alt={article.title}
              boxSize="80px"
              objectFit="cover"
            />
            <Box p={4}>
              <Link href={article.url} fontWeight="bold" color="teal.600">
                {article.title}
              </Link>
            </Box>
          </Flex>
        ))}
        <Button
          alignSelf="start"
          variant="solid"
          colorScheme="teal"
          as="a"
          href="/blog"
        >
          View All Posts
        </Button>
      </Stack>
    </Box>
  );
};

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const entries = await loadPortfolioEntries();
  const featuredEntries = entries.slice(0, 3); // Show first 3 projects

  return {
    props: {
      featuredEntries,
    },
  };
};

export default function Home({ featuredEntries }: HomeProps) {
  return (
    <Box py={{ base: 8, md: 12 }}>
      <Container maxW="container.xl">
        <Stack spacing={{ base: 12, md: 24 }}>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={12}>
            <PortfolioPreview entries={featuredEntries} />
            <HeroSection />
            <DigitalGarden />
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
