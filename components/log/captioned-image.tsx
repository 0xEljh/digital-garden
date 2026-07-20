import { Box, Image, Stack, Text } from "@chakra-ui/react";

interface CaptionedImageProps {
  src: string;
  alt: string;
  caption: string;
  width?: string | number;
}

export const CaptionedImage = ({ src, alt, caption, width = "100%" }: CaptionedImageProps) => {
  return (
    <Stack gap={1} my={6} align="center">
      <Box maxW={width} w="full" overflow="hidden" rounded="md">
        <Image 
          src={src} 
          alt={alt} 
          w="full" 
          h="auto"
          objectFit="cover"
        />
      </Box>
      <Text 
        fontSize="sm" 
        fontFamily="monospace" 
        color="gray.500"
        textAlign="center"
        fontStyle="italic"
        px={2}
      >
        {caption}
      </Text>
    </Stack>
  );
};
