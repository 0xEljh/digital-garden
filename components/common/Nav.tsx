import {
  Center,
  CollapsibleContent,
  CollapsibleRoot,
  Container,
  HStack,
  Spacer,
  Button,
  Link,
  Stack,
  type StackProps,
} from "@chakra-ui/react";
import { CollapsibleTrigger } from "@/components/ui/collapsible-trigger";

export const NavbarLinks = (props: StackProps) => {
  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      gap={{ base: "6", md: "8" }}
      {...props}
    >
      {["Home", "Portfolio", "Posts"].map((item) => (
        <Link
          key={item}
          fontFamily="Tickerbit"
          fontWeight="medium"
          color="fg.muted"
          _hover={{
            _hover: { color: "colorPalette.fg", textDecoration: "none" },
          }}
        >
          {item}
        </Link>
      ))}
    </Stack>
  );
};

export function NavBar() {
  return (
    <Center position="sticky" zIndex="docked" top="6" left="4" right="4">
      <Container
        css={`
          background-color: transparent;
          background-image: radial-gradient(transparent 1px, #ffffff 1px);
          background-size: 4px 4px;
          backdrop-filter: blur(3px);
          mask: linear-gradient(rgb(0, 0, 0) 60%, rgba(0, 0, 0, 0) 100%);
        `}
        borderRadius="l3"
        boxShadow="xs"
        maxW={{ base: "full", md: "fit-content" }}
        px="4"
        py="3"
      >
        <CollapsibleRoot>
          <HStack gap={{ base: "3", md: "8" }}>
            <Spacer hideFrom="md" />
            <NavbarLinks hideBelow="md" />
            {/* <Button size={{ base: "sm", md: "md" }}>Buy Now</Button> */}
            <CollapsibleTrigger />
          </HStack>
          <CollapsibleContent hideFrom="md">
            <NavbarLinks pt="5" pb="2" alignItems="center" />
          </CollapsibleContent>
        </CollapsibleRoot>
      </Container>
    </Center>
  );
}
