import {
  Button,
  Container,
  Heading,
  Stack,
  Text,
  Box,
  Flex,
  useBreakpointValue,
  Grid,
  Image,
  Link,
} from "@chakra-ui/react";
import { QuoteBlock } from "@/components/QuoteBlock";
import { Banner } from "@/components/Banner";

const HeroSection = () => (
  <Stack p={4}>
    <Text
      fontSize={{ base: "lg", md: "2xl" }}
      color="fg.muted"
      maxW={"md"}
      fontFamily="Topoline"
    >
      The digital garden of a full-stack deep learning engineer, trying to find
      his way in the startup world.
    </Text>
    <Text fontSize="lg" color="gray.600" mb={6}>
      I'm still learning, experimenting, and trying to find my footing. Explore
      my work, insights, and projects.
    </Text>
    <Stack direction={{ base: "column", sm: "row" }} spacing={4}>
      <QuoteBlock colorScheme="red" dark={true}>
        Keeping one foot in order so I can dance with the chaos.
      </QuoteBlock>
    </Stack>
  </Stack>
);
// 2) Portfolio Teaser
const PortfolioTeaser = () => {
  // You can replace these “projects” with real data or dynamic content
  const projects = [
    {
      title: "Project A",
      image: "/images/project-a.png",
    },
    {
      title: "Project B",
      image: "/images/project-b.png",
    },
  ];

  return (
    <Box as="section" p={6} h="full">
      {/* Instead of a big heading, let the images/cards do the talking */}
      <Stack spacing={4}>
        {projects.map((proj) => (
          <Flex
            key={proj.title}
            alignItems="center"
            bg="white"
            borderRadius="md"
            boxShadow="sm"
            overflow="hidden"
          >
            <Image
              src={proj.image}
              alt={proj.title}
              boxSize="80px"
              objectFit="cover"
            />
            <Box p={4}>
              <Heading as="h3" size="sm" mb={2}>
                {proj.title}
              </Heading>
              <Text fontSize="xs">A brief description of {proj.title}.</Text>
            </Box>
          </Flex>
        ))}
        <Button
          alignSelf="start"
          variant="ghost"
          colorScheme="teal"
          as="a"
          href="/portfolio"
        >
          Explore Full Portfolio
        </Button>
      </Stack>
    </Box>
  );
};

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

export default function Home() {
  const isMobile = useBreakpointValue({ base: true, md: false });
  return (
    <Box py={{ base: 8, md: 12 }}>
      <Stack spacing={{ base: 12, md: 24 }}>
        {isMobile ? null : <Banner />}
        <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 3fr" }} gap={12}>
          <HeroSection />
          <PortfolioTeaser />

          <DigitalGarden />
        </Grid>
      </Stack>
    </Box>
  );
}
