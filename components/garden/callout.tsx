import { Box, HStack, Text } from "@chakra-ui/react";

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
