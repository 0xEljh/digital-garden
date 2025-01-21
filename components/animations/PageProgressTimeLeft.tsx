import { Text, TextProps } from "@chakra-ui/react";
import {
  motion,
  useScroll,
  useTransform,
  MotionValue,
  useSpring,
  useMotionValueEvent,
} from "motion/react";

interface PageProgressTimerProps extends TextProps {
  maxReadTimeMins: number;
  ref: React.ReactNode;
}

export function PageProgressTimer({
  maxReadTimeMins,
  ...props
}: PageProgressTimerProps) {
  // based on scroll position, estimate time left for reading.
}
