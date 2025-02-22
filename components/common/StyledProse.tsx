import React from "react";
import { Image, Box, type BoxProps } from "@chakra-ui/react";
import { MDXProvider } from "@mdx-js/react";
import { AnimatedHeading } from "@/components/animations/AnimatedHeading";

interface styledProseProps extends BoxProps {
    children: React.ReactNode;
}


export function StyledProse({ children, ...props }: styledProseProps) {
    const components = {
        h1: (props: any) => <AnimatedHeading level={1} {...props} />,
        h2: (props: any) => <AnimatedHeading level={2} {...props} />,
        h3: (props: any) => <AnimatedHeading level={3} {...props} />,
        // ... similarly for h4, h5, h6 if ever needed
    };

    return (
        <Box
            css={{
                // prose styles
                "& h1, & h2, & h3, & h4, & h5, & h6": {
                    color: "fg.default",
                    fontSize: "4xl",
                    lineHeight: "tall",
                    // my: "1em",
                    mt: 16, // top margin larger than bottom to suggest association
                    mb: 4,
                },
                "& p, i, ul, li": {
                    color: "fg.muted",
                    fontSize: ["lg", "xl"],
                    lineHeight: "taller",
                    mb: 4, // Increased bottom margin for paragraphs
                },
                "& a": { color: "brand.secondary" },
                maxWidth: "container.lg",
            }}
            {...props}
        >
            <MDXProvider components={components}>{children}</MDXProvider>
        </Box>
    );
}