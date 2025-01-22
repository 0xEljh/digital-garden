import { Text, Stack, useBreakpointValue } from "@chakra-ui/react";
import { VelocityMarquee } from "@/components/animations/VelocityMarquee";

export function Banner() {
  const fontSizes = { base: "5xl", md: "7xl" };
  const baseVelocity = useBreakpointValue({ base: 180, md: 100 });
  return (
    <Stack spacing={4}>
      <VelocityMarquee
        baseVelocity={baseVelocity}
        items={["Deep Learning", "Startups", "Full-Stack"].map((item) => (
          <Text
            key={item}
            lineHeight={{ base: 1.0, md: 1.2 }}
            fontWeight={600}
            textTransform="uppercase"
            fontSize={fontSizes}
            fontFamily="Aeion Mono"
            letterSpacing={5}
            color="fg.muted"
            whiteSpace="nowrap"
          >
            {item}
          </Text>
        ))}
      />
    </Stack>
  );
}
