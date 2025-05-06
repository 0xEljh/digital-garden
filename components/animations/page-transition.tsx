import { motion } from "motion/react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      // simple placeholder animation for now
      initial={{ opacity: 0, x: 200 }} // initially hidden
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -200 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
