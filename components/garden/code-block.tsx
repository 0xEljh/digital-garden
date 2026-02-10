import {
  Box,
  HStack,
  Card,
  Clipboard,
  Button,
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
