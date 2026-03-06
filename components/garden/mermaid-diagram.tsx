import { Box, Card, Center, HStack, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

interface MermaidDiagramProps {
  chart: string;
}

function sanitizeMermaidId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "");
}

export const MermaidDiagram = ({ chart }: MermaidDiagramProps) => {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(true);
  const instanceId = useId();
  const renderIndexRef = useRef(0);

  const baseId = useMemo(
    () => `mermaid-${sanitizeMermaidId(instanceId)}`,
    [instanceId]
  );

  useEffect(() => {
    let isCancelled = false;
    const source = chart.trim();

    if (!source) {
      setSvg(null);
      setError("Diagram is empty.");
      setIsRendering(false);
      return;
    }

    const renderDiagram = async () => {
      setIsRendering(true);
      setError(null);

      try {
        const mermaid = (await import("mermaid")).default;

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "dark",
          fontFamily: "'Aeion Mono', monospace",
        });

        renderIndexRef.current += 1;
        const { svg: renderedSvg } = await mermaid.render(
          `${baseId}-${renderIndexRef.current}`,
          source
        );

        if (isCancelled) return;
        setSvg(renderedSvg);
      } catch (err) {
        if (isCancelled) return;

        setSvg(null);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to render Mermaid diagram."
        );
      } finally {
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    };

    void renderDiagram();

    return () => {
      isCancelled = true;
    };
  }, [baseId, chart]);

  if (error) {
    return (
      <Card.Root overflow="hidden" variant="outline" m={4} borderColor="orange.700">
        <Card.Header py={2} px={4} bg="blackAlpha.300">
          <HStack justifyContent="space-between">
            <Card.Title as="h4" fontFamily="Tickerbit">
              mermaid
            </Card.Title>
            <Text fontSize="xs" color="orange.300" fontFamily="Aeion Mono">
              render failed
            </Text>
          </HStack>
        </Card.Header>
        <Card.Body p={4}>
          <Text mb={3} fontSize="sm" color="orange.300" fontFamily="Aeion Mono">
            Mermaid could not render this diagram. Showing source.
          </Text>
          <Box
            as="pre"
            overflowX="auto"
            p={4}
            m={0}
            bg="blackAlpha.300"
            rounded="md"
            fontFamily="monospace"
            fontSize="sm"
          >
            <code>{chart}</code>
          </Box>
        </Card.Body>
      </Card.Root>
    );
  }

  if (isRendering && !svg) {
    return (
      <Card.Root overflow="hidden" variant="outline" m={4}>
        <Card.Header py={2} px={4} bg="blackAlpha.300">
          <Card.Title as="h4" fontFamily="Tickerbit">
            mermaid
          </Card.Title>
        </Card.Header>
        <Card.Body p={4}>
          <Center>
            <HStack gap={3}>
              <Spinner size="sm" color="cyan.300" />
              <Text fontSize="sm" color="gray.400" fontFamily="Aeion Mono">
                Rendering diagram...
              </Text>
            </HStack>
          </Center>
        </Card.Body>
      </Card.Root>
    );
  }

  if (!svg) return null;

  return (
    <Card.Root overflow="hidden" variant="outline" m={4}>
      <Card.Header py={2} px={4} bg="blackAlpha.300">
        <Card.Title as="h4" fontFamily="Tickerbit">
          mermaid
        </Card.Title>
      </Card.Header>
      <Card.Body p={0}>
        <Box
          p={4}
          overflowX="auto"
          css={{
            "& svg": {
              display: "block",
              marginInline: "auto",
              maxWidth: "100%",
              height: "auto",
            },
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </Card.Body>
    </Card.Root>
  );
};
