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
                // Heading styles with subtle differentiation
                "& h1": {
                    color: "fg.default",
                    fontSize: "4xl",
                    lineHeight: "tall",
                    fontFamily: "Aeion Mono",
                    mt: 16,
                    mb: 6,
                },
                "& h2": {
                    color: "fg.default",
                    fontSize: "3xl",
                    lineHeight: "tall",
                    fontFamily: "Aeion Mono",
                    mt: 14,
                    mb: 5,
                },
                "& h3": {
                    color: "fg.default",
                    fontSize: "2xl",
                    lineHeight: "tall",
                    fontFamily: "Aeion Mono",
                    mt: 12,
                    mb: 4,
                },
                // Paragraph styles
                "& p": {
                    color: "fg.muted",
                    fontSize: ["lg", "xl"],
                    lineHeight: "taller",
                    mb: 4,
                },
                // List styles
                "& ul, & ol": {
                    color: "fg.muted",
                    fontSize: ["lg", "xl"],
                    lineHeight: "taller",
                    mb: 4,
                    pl: 6, // Left padding for list indentation
                },
                "& li": {
                    mb: 2, // Space between list items
                    position: "relative",
                    "&::before": {
                        content: '"•"', // Bullet point
                        position: "absolute",
                        left: -4,
                        color: "fg.subtle", // Slightly muted bullet color
                    },
                },
                // Nested list adjustments
                "& ul ul, & ol ol, & ul ol, & ol ul": {
                    mt: 2,
                    mb: 0,
                    pl: 4, // Slightly less padding for nested lists
                },
                "& a": { color: "teal.200" },
                maxWidth: "container.lg",
            }}
            {...props}
        >
            <MDXProvider components={components}>{children}</MDXProvider>
        </Box>
    );
}