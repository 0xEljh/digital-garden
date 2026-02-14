import type { BoxProps, ContainerProps } from "@chakra-ui/react";
import { Container } from "@chakra-ui/react";
import type { MDXComponents } from "mdx/types";
import { Link } from "@/components/ui/link";
import { AnimatedHeading } from "@/components/animations/animated-heading";
import {
  CodeBlock,
  CaptionedImage,
  CaptionedVideo,
  Callout,
  Timeline,
  TimelineEntry,
  ElasticSlider,
  PaperPreview,
  GithubPreview,
  VariableEquation,
  LayerDiagram,
  Layer,
  LayerRow,
  InlineLatex,
  VarTooltip,
} from "@/components/garden/post-blocks";

interface StyledProseProps extends ContainerProps {
  children: React.ReactNode;
}

export const mdxComponents: MDXComponents = {
  h1: (p: Record<string, unknown>) => <AnimatedHeading level={1} {...p} />,
  h2: (p: Record<string, unknown>) => <AnimatedHeading level={2} {...p} />,
  h3: (p: Record<string, unknown>) => <AnimatedHeading level={3} {...p} />,
  pre: CodeBlock as React.ComponentType<BoxProps>,
  Callout: Callout as React.ComponentType<BoxProps>,
  CaptionedImage: CaptionedImage as React.ComponentType<BoxProps>,
  CaptionedVideo: CaptionedVideo as React.ComponentType<BoxProps>,
  Timeline: Timeline as React.ComponentType<BoxProps>,
  TimelineEntry: TimelineEntry as React.ComponentType<BoxProps>,
  ElasticSlider: ElasticSlider as React.ComponentType<BoxProps>,
  PaperPreview: PaperPreview as React.ComponentType<BoxProps>,
  GithubPreview: GithubPreview as React.ComponentType<BoxProps>,
  VariableEquation: VariableEquation as React.ComponentType<BoxProps>,
  LayerDiagram: LayerDiagram as React.ComponentType<BoxProps>,
  Layer: Layer as React.ComponentType<BoxProps>,
  LayerRow: LayerRow as React.ComponentType<BoxProps>,
  InlineLatex: InlineLatex as React.ComponentType<BoxProps>,
  VarTooltip: VarTooltip as React.ComponentType<BoxProps>,
  a: (p: Record<string, unknown>) => <Link _hover={{ textDecoration: "italic" }} target="_blank" rel="noopener noreferrer" {...p} />,
};

export function StyledProse({ children, ...props }: StyledProseProps) {

  return (
    <Container
      mx="auto"
      css={{
        /* headings */
        "& h1": {
          fontFamily: "Tickerbit",
          fontSize: "clamp(2rem, 6vw, 2.75rem)",
          marginTop: "3rem",
          marginBottom: "1rem",
          color: "gray.50",
        },
        "& h2": {
          fontFamily: "Tickerbit",
          fontSize: "clamp(1.5rem, 4.5vw, 2.25rem)",
          marginTop: "2.5rem",
          marginBottom: "1rem",
          color: "gray.50",
        },
        "& h3": {
          fontFamily: "Tickerbit",
          fontSize: "clamp(1.25rem, 3.5vw, 1.625rem)",
          marginTop: "2rem",
          marginBottom: "0.75rem",
          color: "gray.50",
        },
        /* body text */
        "& p, & li": {
          fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
          lineHeight: 1.75,
          // fontWeight: "50",
        },
        "& ul, & ol": {
          paddingInlineStart: "2rem",
          marginY: "1rem",
        },
        /* list styling */
        "& ul": {
          listStyleType: "disc",
          "& ul": {
            listStyleType: "circle",
            "& ul": {
              listStyleType: "square",
            },
          },
        },
        "& ol": {
          listStyleType: "decimal",
          "& ol": {
            listStyleType: "lower-alpha",
            "& ol": {
              listStyleType: "lower-roman",
            },
          },
        },
        "& blockquote": {
          borderLeft: "4px solid",
          borderColor: "gray.300",
          paddingInlineStart: "1rem",
          color: "gray.600",
          fontStyle: "italic",
          marginY: "1.5rem",
        },
        /* KaTeX block fix */
        ".katex-display": {
          overflowX: "auto",
          marginY: "1.5rem",
        },
      }}
      {...props}
      color="gray.300"
      fontFamily="body"
      fontWeight="400"
    >
      {children}
    </Container>
  );
}
