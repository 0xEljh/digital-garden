import { Button, Container, Stack, Text } from "@chakra-ui/react";

const siteNav = [
  { title: "Home", url: "/" },
  { title: "Posts", url: "/posts" },
  { title: "Portfolio", url: "/portfolio" },
];

export default function ErrorPage() {
  // get user computer name or something
  const name = "anon";
  return (
    <Stack py={{ base: 8, md: 12 }} textAlign="center" alignItems="center">
      <Container py={{ base: 16, md: 24 }}>
        <Stack>
          <Text fontFamily="Tickerbit">Opps. Wrong page?</Text>
          <Text fontFamily="Tickerbit" color="fg.muted">
            {name} fell off the edge of the world
          </Text>
        </Stack>
      </Container>
      <Stack>
        <Container>
          <Text fontFamily="Tickerbit">Select spawn point</Text>
        </Container>
        <Container>
          <Stack direction={{ base: "column", md: "row" }} alignItems="center">
            {/* nav buttons */}
            {siteNav.map(({ title, url }) => {
              return (
                <Button
                  key={url}
                  as={"a"}
                  variant="tertiary"
                  fontFamily="Aeion Mono"
                  fontWeight="40"
                  href={url}
                >
                  {title}
                </Button>
              );
            })}
          </Stack>
        </Container>
      </Stack>
    </Stack>
  );
}
