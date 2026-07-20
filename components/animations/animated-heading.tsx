import React from "react";
import {
    Heading,
    type SystemStyleObject,
} from "@chakra-ui/react";

type AnimatedHeadingProps = {
    level: number;
    children?: React.ReactNode;
    sx?: SystemStyleObject;
};

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export const AnimatedHeading: React.FC<AnimatedHeadingProps> = ({
    level,
    children,
    sx,
    ...props
}) => {
    return (
        <Heading
            as={`h${Math.min(Math.max(level, 1), 6)}` as HeadingLevel}
            css={sx}
            {...props}
        >
            {children}
        </Heading>
    );
};
