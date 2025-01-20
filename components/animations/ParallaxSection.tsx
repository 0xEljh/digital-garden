import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  MotionValue,
  useSpring,
  useMotionValueEvent,
} from "motion/react";
import { Box} from "@chakra-ui/react";
import { RefObject } from "react";

const MotionBox = motion.create(Box);

interface ParallaxSectionProps {
  children: React.ReactNode;
  distance: number;
  containerRef?: RefObject<HTMLElement>; //reference to the container element
  // title?: string;
  [prop: string]: any;
}

function useParallax(value: MotionValue<number>, distance: number) {
  return useSpring(useTransform(value, [0, 1], [0, distance]), {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });
}

export function ParallaxSection({
  children,
  containerRef,
  distance,
  ...rest
}: ParallaxSectionProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    // container: containerRef ? containerRef : undefined,
    layoutEffect: false,
    offset: ["center center", "end end"],
  });
  const y = useParallax(scrollYProgress, distance);
  useMotionValueEvent(y, "change", (value) => {
    console.log(value);
  });

  return <MotionBox style={{ translateY: -y }}>{children}</MotionBox>;
}