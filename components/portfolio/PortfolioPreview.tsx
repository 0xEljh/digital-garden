import { AnimatePresence, motion, useCycle } from "motion/react";
import { Box, Heading, Container, Stack, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { PortfolioCard } from "./PortfolioCard";
import type { PortfolioEntry } from "@/types/portfolio";
import { FaDownload } from "react-icons/fa6";

const MotionBox = motion.create(Box);
const MotionButton = motion.create(Button);

export const PortfolioPreview = ({
  entries,
}: {
  entries: PortfolioEntry[];
}) => {
  const [page, cyclePage] = useCycle(...entries.map((_, i) => i));
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>(null);

  // Auto-rotate every 8 seconds when not hovered
  useEffect(() => {
    if (!isHovered && entries.length > 1) {
      intervalRef.current = setInterval(() => {
        setDirection(1);
        cyclePage();
      }, 8000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, cyclePage, entries.length]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    cyclePage();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "20%" : "-20%",
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 20,
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    }),
  };

  return (
    <Stack gap={6}>
      <Heading size="md" fontFamily="Topoline" fontWeight="100">
        Recent projects/work
      </Heading>
      <Box
        py={16}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Stack gap={8} align="center" direction="column">
          <Box position="relative" w="full" maxW="container.lg" h="400px">
            <AnimatePresence initial={false} custom={direction}>
              <MotionBox
                key={page}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                position="absolute"
                w="full"
                h="full"
                cursor="grab"
                whileTap="grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  if (swipe < -10000) {
                    setDirection(1);
                    cyclePage();
                  }
                  if (swipe > 10000) {
                    setDirection(-1);
                    cyclePage();
                  }
                }}
              >
                <PortfolioCard entry={entries[page]} />
              </MotionBox>
            </AnimatePresence>
          </Box>

          {/* Pagination Dots */}
          {entries.length > 1 && (
            <Flex gap={3} justify="center">
              {entries.map((_, index) => (
                <MotionButton
                  key={index}
                  onClick={() => {
                    setDirection(index > page ? 1 : -1);
                    cyclePage(index);
                  }}
                  p={0}
                  rounded="full"
                  size="xs"
                />
              ))}
            </Flex>
          )}

          <Stack direction={{ base: "column-reverse", md: "row" }}>
            <Button
              colorScheme="teal"
              variant="outline"
              size="md"
              alignSelf="center"
              fontWeight="40"
              asChild
            >
              <Link href="/api/download-resume">
                <FaDownload />
                My Resume
              </Link>
            </Button>
            <Button
              asChild
              colorScheme="teal"
              variant="outline"
              size="md"
              alignSelf="center"
              fontWeight="40"
            >
              <Link href="/portfolio">Full Portfolio</Link>
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
};
