import React from "react";
import { Image, Box, type BoxProps, Container } from "@chakra-ui/react";
import { Link } from "@/components/ui/link";
import { MDXProvider } from "@mdx-js/react";
import { AnimatedHeading } from "@/components/animations/animated-heading";
import { CodeBlock } from "@/components/garden/post-blocks";
import { Callout } from "@/components/garden/post-blocks";

interface StyledProseProps extends BoxProps {
  children: React.ReactNode;
}

export function StyledProse({ children, ...props }: StyledProseProps) {
  const components = {
    h1: (p: any) => <AnimatedHeading level={1} {...p} />,
    h2: (p: any) => <AnimatedHeading level={2} {...p} />,
    h3: (p: any) => <AnimatedHeading level={3} {...p} />,
    pre: CodeBlock,
    code: (p: any) => <code style={{ fontFamily: "monospace" }} {...p} />,
    Callout,
    a: (p: any) => <Link _hover={{ textDecoration: "italic" }} {...p} />,
  };

  return (
    <Container
      // maxW="65ch"
      mx="auto"
      // px={{ base: 4, md: 12, lg: 24 }}
      css={{
        /* headings */
        "& h1": {
          fontFamily: "Aeion Mono",
          fontSize: "clamp(2rem, 6vw, 2.75rem)",
          marginTop: "3rem",
          marginBottom: "1rem",
        },
        "& h2": {
          fontFamily: "Aeion Mono",
          fontSize: "clamp(1.5rem, 4.5vw, 2.25rem)",
          marginTop: "2.5rem",
          marginBottom: "1rem",
        },
        "& h3": {
          fontFamily: "Aeion Mono",
          fontSize: "clamp(1.25rem, 3.5vw, 1.625rem)",
          marginTop: "2rem",
          marginBottom: "0.75rem",
        },
        /* body text */
        "& p, & li": {
          fontFamily: "var(--chakra-fonts-body)",
          fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
          lineHeight: 1.75,
        },
        "& ul, & ol": {
          paddingInlineStart: "1.25rem",
          marginY: "1rem",
        },
        "& blockquote": {
          borderLeft: "4px solid",
          borderColor: "gray.300",
          paddingInlineStart: "1rem",
          color: "gray.600",
          fontStyle: "italic",
          marginY: "1.5rem",
        },
        /* inline code */
        "& :not(pre) > code": {
          background: "gray.100",
          padding: "0.2em 0.4em",
          borderRadius: "4px",
          fontSize: "0.875em",
        },
        /* KaTeX block fix */
        ".katex-display": {
          overflowX: "auto",
          marginY: "1.5rem",
        },
      }}
      {...props}
    >
      <MDXProvider components={components}>{children}</MDXProvider>
    </Container>
  );
}
