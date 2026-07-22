import { Box, Stack, Text } from "@chakra-ui/react";
import type { SystemStyleObject } from "@chakra-ui/react";

interface CaptionedVideoProps {
  src?: string;
  youtubeId?: string;
  caption?: string;
  width?: SystemStyleObject["maxWidth"];
  aspectRatio?: string;
}

export const CaptionedVideo = ({
  src,
  youtubeId,
  caption,
  width = { base: "100%", md: "83.3333%" },
  aspectRatio = "16/9",
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
        aspectRatio={aspectRatio}
      >
        {youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={caption ?? "Embedded video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
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
              height: "100%",
              borderRadius: "var(--chakra-radii-md)",
            }}
          />
        ) : null}
      </Box>
      {caption && (
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
      )}
    </Stack>
  );
};
