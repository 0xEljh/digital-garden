import { useRef, ReactNode, useEffect, useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
  wrap
} from "motion/react";

interface MarqueeProps {
  children: ReactNode;
  baseVelocity: number;
}

export function VelocityMarquee({ children, baseVelocity = 100 }: MarqueeProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });
  const childRef = useRef<HTMLDivElement>(null);
  const [numberOfChildren, setNumberOfChildren] = useState<number>(1);

  useEffect(() => {
    if (childRef.current) {
      const calculatedChildren = calculateNumberOfChildren(childRef.current);
      setNumberOfChildren(calculatedChildren);
    }
  }, []);

  const wrapMin = -20;
  const wrapMax = wrapMin - 1000 / numberOfChildren;

  const x = useTransform(baseX, (v) => `${wrap(wrapMin, wrapMax, v)}%`);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  const childrenArray = new Array(numberOfChildren).fill(
    <Box ref={childRef} marginRight="30px">
      {children}
    </Box>
  );

  return (
    <Flex direction="column" overflowX="hidden" m={0}>
      <Box
        as={motion.div}
        style={{ x }}
        whiteSpace="nowrap"
        display="flex"
        flexWrap="nowrap"
      >
        {childrenArray.map((child, index) => (
          <Box key={index}>{child}</Box>
        ))}
      </Box>
    </Flex>
  );
}

function calculateNumberOfChildren(childElement: HTMLDivElement): number {
  if (!childElement) return 1;
  const viewportWidth = window.innerWidth;
  const childWidth = childElement.offsetWidth;
  return Math.max(Math.ceil((viewportWidth * 2) / childWidth), 1);
}
