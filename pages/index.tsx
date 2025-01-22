import {
  Button,
  Container,
  Heading,
  Stack,
  Text,
  Box,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react";
import { QuoteBlock } from "@/components/QuoteBlock";
import { Banner } from "@/components/Banner";

export default function Home() {
  return (
    <Box py={{ base: 8, md: 12 }}>
      <Stack>
        <Container py={{ base: "16", md: "24" }}>
          <Stack direction={"column"} spacing={{ base: 12, md: 24 }}>
            <Banner />
            <Stack direction="column" px={{ base: 0, md: 8 }}>
              <Text
                fontSize={{ base: "lg", md: "2xl" }}
                color="fg.muted"
                maxW={"md"}
                fontFamily="Topoline"
              >
                The digital garden of a full-stack deep learning engineer,
                trying to find his way in the startup world.
              </Text>
              <Stack direction={{ base: "column", md: "row" }} spacing="3">
                <Button
                  size={{ base: "lg", md: "xl" }}
                  variant="primary"
                  as="a"
                  href="mailto:hello@0xeljh.com?subject=Getting%20In%20Touch"
                >
                  Contact Me
                </Button>
                <Button
                  variant="secondary"
                  size={{ base: "lg", md: "xl" }}
                  as="a"
                  href="#portfolio"
                >
                  Portfolio
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Container>
        <Container py={{ base: 8, md: 16 }}>
          <QuoteBlock colorScheme="red" dark={true}>
            Keeping one foot in order so I can dance with the chaos.
          </QuoteBlock>
        </Container>
      </Stack>
    </Box>
  );
}
