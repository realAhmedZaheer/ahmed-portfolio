"use client";
import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/** Stagger container + a fade-and-rise child. Reduced motion is handled globally
    by <MotionProvider>'s MotionConfig (transforms are dropped, opacity kept). */
export const revealContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
export const revealItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.2, 0.7, 0.2, 1] } },
};

/** Entry-reveal group: animates its <RevealItem> children in, staggered, on mount. */
export function RevealGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={revealContainer} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  );
}

/** A single staggered block inside a <RevealGroup>. */
export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={revealItem} className={className}>
      {children}
    </motion.div>
  );
}

/** Scroll-triggered reveal - fades + rises once when it enters the viewport. */
export function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
