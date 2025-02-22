import { Box, Container, Heading, Text, VStack, Separator } from "@chakra-ui/react";

export default function Home() {
  return (
    <Container maxW="container.lg" py={10}>
      <VStack gap={8} align="stretch">
        {/* Aeion Mono - Variable Font */}
        <Box>
          <Heading mb={4} fontFamily="inherit">Aeion Mono (Variable Font)</Heading>
          <VStack align="stretch" gap={3} fontSize="lg">
            <Text fontFamily="'Aeion Mono'" fontWeight={1}>
              Aeion Mono Light (1) - The quick brown fox jumps over the lazy dog
            </Text>
            <Text fontFamily="'Aeion Mono'" fontWeight={40}>
              Aeion Mono Regular (40) - The quick brown fox jumps over the lazy dog
            </Text>
            <Text fontFamily="'Aeion Mono'" fontWeight={70}>
              Aeion Mono Bold (70) - The quick brown fox jumps over the lazy dog
            </Text>
            <Text fontFamily="'Aeion Mono'" fontWeight={90}>
              Aeion Mono Black (90) - The quick brown fox jumps over the lazy dog
            </Text>
          </VStack>
        </Box>

        <Separator />

        {/* Topoline - Variable Font */}
        <Box>
          <Heading mb={4} fontFamily="inherit">Topoline (Variable Font)</Heading>
          <VStack align="stretch" gap={3}>
            <Text fontFamily="'Topoline'" fontWeight={100}>
              Topoline Light (100) - The quick brown fox jumps over the lazy dog
            </Text>
            <Text fontFamily="'Topoline'" fontWeight={400}>
              Topoline Regular (400) - The quick brown fox jumps over the lazy dog
            </Text>
            <Text fontFamily="'Topoline'" fontWeight={700}>
              Topoline Bold (700) - The quick brown fox jumps over the lazy dog
            </Text>
            <Text fontFamily="'Topoline'" fontWeight={900}>
              Topoline Black (900) - The quick brown fox jumps over the lazy dog
            </Text>
          </VStack>
        </Box>

        <Separator />

        {/* Tickerbit */}
        <Box>
          <Heading mb={4} fontFamily="inherit">Tickerbit</Heading>
          <Text fontFamily="'Tickerbit'">
            Tickerbit Regular - The quick brown fox jumps over the lazy dog
          </Text>
        </Box>

        <Separator />

        {/* YE Display */}
        <Box>
          <Heading mb={4} fontFamily="inherit">YE Display</Heading>
          <Text fontFamily="'YE Display'">
            YE Display Regular - The quick brown fox jumps over the lazy dog
          </Text>
        </Box>
      </VStack>
    </Container>
  );
}