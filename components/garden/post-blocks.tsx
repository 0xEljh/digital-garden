import {
  Box,
  HStack,
  Card,
  Clipboard,
  IconButton,
  Button,
  Text,
  Image,
  Flex,
  Stack,
} from "@chakra-ui/react";

interface CodeBlockProps {
  children: React.ReactElement<{ children: string; className?: string }>;
}

export const CodeBlock = ({ children }: CodeBlockProps) => {
  const codeString = children.props.children.trim();
  const language = children.props.className?.replace(/language-/, "") || "";
  return (
    <Card.Root overflow="hidden" variant="outline" m={4}>
      <Card.Header py={2} px={4} bg="blackAlpha.300">
        <HStack justifyContent="space-between">
          <Card.Title as="h4" fontFamily="Tickerbit">
            {language}
          </Card.Title>
          <ClipboardEntry value={codeString} />
        </HStack>
      </Card.Header>
      <Card.Body
        p={0}
        css={{
          code: {
            fontFamily: "monospace",
            whiteSpace: "pre",
            fontSize: "0.875em",
          },
        }}
      >
        <Box
          as="pre"
          overflowX="auto"
          p={4}
          m={0}
          fontFamily="monospace"
          css={{
            "&::-webkit-scrollbar": {
              height: "8px",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(155, 155, 155, 0.4)",
              borderRadius: "4px",
            },
          }}
        >
          <code>{children.props.children}</code>
        </Box>
      </Card.Body>
    </Card.Root>
  );
};

const ClipboardEntry = (props: { value: string }) => {
  return (
    <Clipboard.Root colorPalette={"gray"} value={props.value} timeout={1000}>
      <Clipboard.Trigger asChild>
        <Button variant="surface" size="sm">
          <Clipboard.Indicator />
          <Clipboard.CopyText />
        </Button>
      </Clipboard.Trigger>
    </Clipboard.Root>
  );
};

interface CalloutProps {
  title: string;
  children: React.ReactNode;
  type?: "info" | "success" | "warning" | "danger";
}

export function Callout({ title, children, type = "info" }: CalloutProps) {
  const colors: Record<string, string> = {
    info: "cyan",
    success: "green",
    warning: "orange",
    danger: "red",
    auxillary: "gray",
  };
  const c = colors[type] || "cyan";
  return (
    <HStack
      align="flex-start"
      bg={`${c}.900`}
      borderLeftWidth="4px"
      borderColor={`${c}.400`}
      p={4}
      rounded="md"
      my={6}
      gap={{ base: 2, md: 4 }}
    >
      <Text fontFamily="Tickerbit" color={`${c}.300`}>
        {title}
      </Text>
      <Box>{children}</Box>
    </HStack>
  );
}

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
