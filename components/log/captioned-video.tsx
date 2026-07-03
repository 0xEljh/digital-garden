import { Box, Stack, Text } from "@chakra-ui/react";

interface CaptionedVideoProps {
  src?: string;
  youtubeId?: string;
  caption: string;
  width?: string | number;
  height?: string | number;
  aspectRatio?: string;
}

export const CaptionedVideo = ({ 
  src, 
  youtubeId, 
  caption, 
  width = "100%", 
  height = "auto", 
  aspectRatio = "16/9" 
}: CaptionedVideoProps) => {
  if (!src && !youtubeId) {
    console.warn("CaptionedVideo requires either src or youtubeId");
    return null;
  }
  
  return (
    <Stack gap={1} my={8} align="center">
      <Box 
        maxW={width} 
        w="full" 
        overflow="hidden" 
        rounded="md"
        position="relative"
        paddingBottom={src ? undefined : aspectRatio === "16/9" ? "56.25%" : "75%"} // 16:9 or 4:3 aspect ratio
      >
        {youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={caption}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
          />
        ) : src ? (
          <video
            src={src}
            controls
            style={{
              width: "100%",
              height: typeof height === "string" ? height : `${height}px`,
              borderRadius: "var(--chakra-radii-md)",
            }}
          />
        ) : null}
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
