import { ImQuotesLeft, ImQuotesRight } from "react-icons/im";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ReactNode } from "react";
import { TransitIn } from "@/components/animations/transit-in";

interface QuoteBlockProps {
  colorScheme: string;
  children: ReactNode;
  dark?: boolean;
}

export const QuoteBlock = (props: QuoteBlockProps) => {
  const { children, colorScheme: c, dark } = props;
  const accentColor = dark ? `${c}.600` : `${c}.400`;

  return (
    <Flex direction="column" rounded={{ md: "lg" }}>
      <Flex
        direction="column"
        position="relative"
        mb="4"
        textAlign="center"
        justify="center"
        align="center"
        pt="10"
        pb="6"
        px="10"
      >
        <Box as="blockquote" maxW="340px" mx="auto" my="4">
          <Box
            position="absolute"
            top="6"
            left="20"
            display={{ base: "none", md: "inline" }}
            fontSize="3xl"
            color={accentColor}
            opacity={0.2}
          >
            <ImQuotesLeft />
          </Box>
          <TransitIn>
            <Text fontSize="lg" color={dark ? "white" : "black"}>
              {children}
            </Text>
          </TransitIn>
          <Box
            position="absolute"
            bottom="-2"
            right="20"
            display={{ base: "none", md: "inline" }}
            fontSize="3xl"
            color={accentColor}
            opacity={0.2}
          >
            <ImQuotesRight />
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};
