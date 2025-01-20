import { motion } from "motion/react";

export function PageTransition({
  children,
  key,
}: {
  children: React.ReactNode;
  key: string;
}) {
  return (
    <motion.div
      // simple placeholder animation for now
      key={key}
      initial={{ opacity: 0, y: 20 }} // initially hidden
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }} 
      transition={{ duration: 0.5 }} 
    >
      {children}
    </motion.div>
  );
}
