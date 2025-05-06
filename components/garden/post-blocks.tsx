import { FiCopy, FiCheck } from "react-icons/fi";
import { Box, Clipboard, IconButton, HStack, Text } from "@chakra-ui/react";

interface CodeBlockProps {
  children: string;
}

export function CodeBlock({ children }: CodeBlockProps) {
  return (
    <Box position="relative" my={6}>
      <Box
        as="pre"
        overflowX="auto"
        bg="gray.50"
        p={4}
        rounded="md"
        fontSize="sm"
        lineHeight="tall"
      >
        <code>{children}</code>
      </Box>
      <Clipboard.Root value={children}>
        <Clipboard.Trigger asChild>
          <IconButton variant="surface" size="xs">
            <Clipboard.Indicator />
          </IconButton>
        </Clipboard.Trigger>
      </Clipboard.Root>
    </Box>
  );
}

interface CalloutProps {
  title: string;
  children: React.ReactNode;
  type?: "info" | "success" | "warning" | "danger";
}

export function Callout({ title, children, type = "info" }: CalloutProps) {
  const colors: Record<string, string> = {
    info: "blue",
    success: "green",
    warning: "orange",
    danger: "red",
  };
  const c = colors[type] || "blue";
  return (
    <HStack
      align="flex-start"
      bg={`${c}.50`}
      _dark={{ bg: `${c}.900` }}
      borderLeftWidth="4px"
      borderColor={`${c}.400`}
      p={4}
      rounded="md"
      my={6}
      gap={3}
    >
      <Text fontWeight="bold" color={`${c}.300`}>
        {title}
      </Text>
      <Box>{children}</Box>
    </HStack>
  );
}
