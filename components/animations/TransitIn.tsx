import { motion } from "framer-motion";
import { Box, BoxProps } from "@chakra-ui/react";
import { useMemo } from "react";

export const MotionBox = motion(Box);

interface TransitInProps {
  children: React.ReactNode;
  props?: BoxProps;
}
  
// Animation settings abstraction
const useEntranceAnimation = () => {
  const animationSettings = useMemo(
    () => ({
      initial: { opacity: 0, translateY: 80 },
      whileInView: {
        opacity: 1,
        translateY: 0,
        transition: { duration: 1.0, type: "spring", bounce: 0.3 },
      },
      viewport: { once: true, amount: 0.1 },
    }),
    []
  );

  return animationSettings;
};

export const TransitIn = ({ children, ...props }: TransitInProps) => {
  const animationSettings = useEntranceAnimation();
  return (
    <MotionBox {...animationSettings} {...props}>
      {children}
    </MotionBox>
  );
};