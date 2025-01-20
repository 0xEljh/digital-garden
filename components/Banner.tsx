import { Text, Stack, useBreakpointValue } from "@chakra-ui/react";
import { VelocityMarquee } from "@/components/animations/VelocityMarquee";

export function Banner() {
  const fontSizes = { base: "5xl", md: "7xl" };
  const baseVelocity = useBreakpointValue({ base: 12, md: 5 });
  return (
    <Stack spacing={4}>
      <VelocityMarquee baseVelocity={-1 * (baseVelocity ?? 5)}>
        <Text
          lineHeight="1.2"
          fontWeight={600}
          textTransform="uppercase"
          fontSize={fontSizes}
          fontFamily="Aeion Mono"
          letterSpacing={5}
          color="fg.muted"
        >
          Deep Learning Startups Full-Stack
        </Text>
      </VelocityMarquee>
      <VelocityMarquee baseVelocity={baseVelocity ?? 5}>
        <Text
          lineHeight="1.2"
          fontWeight={100}
          textTransform="uppercase"
          fontSize={fontSizes}
          fontFamily="Aeion Mono"
          letterSpacing={5}
          color="fg.muted"
        >
          Deep Learning Startups Full-Stack
        </Text>
      </VelocityMarquee>
    </Stack>
  );
}