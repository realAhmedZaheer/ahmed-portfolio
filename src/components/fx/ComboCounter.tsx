"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { isReducedMotion } from "@/lib/motionPref";
import { playSound } from "@/lib/sfx";

interface ComboCounterProps {
  hits: number;
}

/** Scroll-triggered arcade "COMBO!" flourish shown between sections. */
export function ComboCounter({ hits }: ComboCounterProps) {
  // Toggles the full-width cyan line flash; gated to non-reduced motion.
  const [flash, setFlash] = useState(false);

  return (
    <div aria-hidden className="relative flex justify-center py-12">
      {/* full-viewport-width 1px cyan line flash behind the text (200ms fade) */}
      {flash ? (
        <motion.span
          aria-hidden
          initial={{ opacity: 0.9, scaleX: 0.2 }}
          animate={{ opacity: 0, scaleX: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onAnimationComplete={() => setFlash(false)}
          className="pointer-events-none absolute left-1/2 top-1/2 h-px w-screen -translate-x-1/2 -translate-y-1/2 bg-cyan [box-shadow:0_0_10px_var(--cyan)]"
        />
      ) : null}

      <motion.div
        initial={{ scale: 0.3, opacity: 0, rotate: -6 }}
        whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
        onViewportEnter={() => {
          // only on a real scroll-in - not when it resolves at mount/load
          if (window.scrollY > 100) {
            playSound("combo");
            if (!isReducedMotion()) setFlash(true);
          }
        }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 460, damping: 11 }}
        className="relative text-center"
      >
        <div className="font-pixel text-2xl text-pink [text-shadow:0_0_14px_var(--pink)]">
          COMBO&nbsp;!
        </div>
        <div className="font-pixel mt-3 text-4xl text-white [text-shadow:2px_0_var(--pink),-2px_0_var(--cyan)]">
          {hits} HITS
        </div>
      </motion.div>
    </div>
  );
}
