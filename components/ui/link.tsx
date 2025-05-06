import { Link as ChakraLink, LinkProps } from "@chakra-ui/react";
import NextLink from "next/link";

// chakra link for styling, next link for routing

interface NextLinkProps extends LinkProps {
  href: string; // overwrite default which is string | undefined
  children: React.ReactNode;
}

export const Link = ({ href, children, ...chakraProps }: NextLinkProps) => {
  return (
    <ChakraLink asChild _hover={{ textDecoration: "none" }} {...chakraProps}>
      <NextLink href={href}>{children}</NextLink>
    </ChakraLink>
  );
};
