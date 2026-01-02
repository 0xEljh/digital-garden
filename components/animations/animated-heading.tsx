import React from "react";
import { m } from "motion/react";
import {
    Heading,
    type SystemStyleObject,
} from "@chakra-ui/react";

type AnimatedHeadingProps = {
    level: number;
    children: React.ReactNode;
    sx?: SystemStyleObject;
};

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const MotionHeading = m.create(Heading);

export const AnimatedHeading: React.FC<AnimatedHeadingProps> = ({
    level,
    children,
    sx,
    ...props
}) => {
    const animationSettings = {
        initial: { opacity: 0, y: 80 },
        whileInView: {
            opacity: 1,
            y: 0,
            transition: { duration: 1.0, type: "spring", bounce: 0.3 }
        },
        viewport: { once: true, amount: 0.1 }
    };

    return (
        <MotionHeading
            as={`h${Math.min(Math.max(level, 1), 6)}` as HeadingLevel}
            css={sx}
            {...animationSettings}
            {...props}
        >
            {children}
        </MotionHeading>
    );
};