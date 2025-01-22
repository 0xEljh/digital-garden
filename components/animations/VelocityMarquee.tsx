import { Center, Flex, type FlexProps } from "@chakra-ui/react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from "framer-motion";
import { useRef, useEffect, useState } from "react";

const MotionFlex = motion(Flex);

interface VelocityMarqueeProps extends FlexProps {
  items: React.ReactNode[];
  gutter?: FlexProps["marginEnd"];
  baseVelocity?: number;
}

interface MarqueeProps extends FlexProps {
  items: React.ReactNode[];
  gutter?: FlexProps["marginEnd"];
  speed?: string;
}

const Mirror = (props: FlexProps) => (
  <>
    <Flex {...props} />
    <Flex aria-hidden {...props} />
  </>
);

export const Marquee = (props: MarqueeProps) => {
  const { items, gutter = "3.75rem", speed = "10s", ...rest } = props;
  const animation = `slide-to-left-full ${speed} linear infinite`;
  return (
    <Flex
      {...rest}
      overflow="hidden"
      maskImage="linear-gradient(var(--mask-direction,to right),#0000,#000 10%,#000 90%,#0000)"
    >
      <Mirror animation={animation}>
        {items.map((item, index) => (
          <Center marginEnd={gutter} key={index}>
            {item}
          </Center>
        ))}
      </Mirror>
    </Flex>
  );
};

export const VelocityMarquee = (props: VelocityMarqueeProps) => {
  const { items, gutter = "3.75rem", baseVelocity = 100, ...rest } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
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

  useEffect(() => {
    if (contentRef.current) {
      const totalWidth = Array.from(contentRef.current.children).reduce(
        (acc, child) => acc + child.getBoundingClientRect().width,
        0
      );
      setContentWidth(totalWidth);
    }
  }, [items, gutter]);

  const x = useTransform(baseX, (value) => `${-value % contentWidth}px`);

  useAnimationFrame((t, delta) => {
    if (!contentWidth) return;

    const moveBy =
      baseVelocity * (delta / 1000) * (1 + Math.abs(velocityFactor.get()));
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <Flex
      {...rest}
      ref={containerRef}
      overflow="hidden"
      maskImage="linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)"
    >
      <MotionFlex
        ref={contentRef}
        style={{ x }}
        display="flex"
        animate={{
          x: [`0px`, `-${contentWidth}px`],
          transition: { duration: 10, repeat: Infinity, ease: "linear" },
        }}
      >
        {/* Original Items */}
        {items.map((item, index) => (
          <Center key={`original-${index}`} marginEnd={gutter}>
            {item}
          </Center>
        ))}

        {/* Mirrored Clone */}
        {items.map((item, index) => (
          <Center key={`clone-${index}`} marginEnd={gutter} aria-hidden>
            {item}
          </Center>
        ))}
      </MotionFlex>
    </Flex>
  );
};
