"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { GlitchText } from "@/components/fx/GlitchText";
import { ScrollReveal } from "@/components/motion/Reveal";
import { PixelDiagram, type PixelDiagramNode } from "@/components/work/PixelDiagram";
import { isReducedMotion } from "@/lib/motionPref";
import { playSound } from "@/lib/sfx";
import type { CaseStudy as CaseStudyData } from "@/types/content";

interface CaseStudyProps {
  study: CaseStudyData;
  children?: React.ReactNode;
}

/** Architecture flow per boss, derived from the case-study content. */
const DIAGRAMS: Record<string, { nodes: PixelDiagramNode[]; srLabel: string }> = {
  "command-center": {
    srLabel:
      "Architecture flow: user request to Gemini function-calling, fanning out to 30+ tools, returning a result.",
    nodes: [
      { label: "USER", color: "text-white" },
      { label: "GEMINI", color: "text-cyan" },
      { label: "30+ TOOLS", color: "text-yellow" },
      { label: "RESULT", color: "text-term" },
    ],
  },
  "dataset-quality": {
    srLabel:
      "Scoring pipeline: image through SigLIP, DETR, sharpness, dedup, into a weighted score.",
    nodes: [
      { label: "IMAGE", color: "text-white" },
      { label: "SigLIP", color: "text-cyan" },
      { label: "DETR", color: "text-purple" },
      { label: "SHARP", color: "text-yellow" },
      { label: "DEDUP", color: "text-pink" },
      { label: "SCORE", color: "text-term" },
    ],
  },
};

/** Boss-level case study: HP bar, glitch title, summary, architecture, metrics, demo slot. */
export function CaseStudy({ study, children }: CaseStudyProps) {
  const diagram = DIAGRAMS[study.id];
  // Frames driving the ~2px / 60ms screen shake when the HP bar bottoms out.
  const [shakeKey, setShakeKey] = useState(0);

  /** Fired when the HP bar finishes draining - the boss takes the hit. */
  function onHpDrained() {
    playSound("slam"); // heavy-impact "boss hit" cue (no dedicated bossHit in sfx)
    if (!isReducedMotion()) setShakeKey((k) => k + 1);
  }

  return (
    <motion.div
      animate={shakeKey ? { x: [0, -2, 2, -1, 0] } : undefined}
      transition={{ duration: 0.06, ease: "linear" }}
      className="hud-frame relative border-2 border-cyan/40 bg-gradient-to-br from-bg2 to-[#090614] p-6 sm:p-9"
    >
      <span
        aria-hidden
        className="font-pixel absolute right-0 top-0 bg-pink px-3 py-2 text-[8px] text-[#1a1030]"
      >
        ☠ BOSS LEVEL
      </span>

      {/* boss HP bar */}
      <div aria-hidden className="mb-6 max-w-sm">
        <div className="font-pixel mb-1.5 text-[7px] text-dim">BOSS HP</div>
        <div className="h-2.5 border border-pink/60 bg-black/50 p-[2px]">
          <motion.div
            initial={{ width: "100%" }}
            whileInView={{ width: "8%" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1.4, ease: "easeInOut", delay: 0.3 }}
            onAnimationComplete={onHpDrained}
            className="h-full bg-gradient-to-r from-[#ff3b30] to-pink"
          />
        </div>
      </div>

      <GlitchText
        text={study.title}
        as="h3"
        className="text-sm leading-relaxed text-white sm:text-xl"
      />

      <p className="font-term mt-4 max-w-2xl text-xl leading-snug text-[#c8bff0]">
        {study.summary}
      </p>

      {diagram ? (
        <ScrollReveal className="mt-6" delay={0.1}>
          <div className="font-pixel mb-2 text-[7px] text-dim">▶ ARCHITECTURE</div>
          <PixelDiagram nodes={diagram.nodes} srLabel={diagram.srLabel} />
        </ScrollReveal>
      ) : null}

      <dl className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {study.metrics.map((m) => (
          <div
            key={m.label}
            className="pixel-corners border border-yellow/40 bg-black/40 px-4 py-3 text-center"
          >
            <dt className="font-term order-2 mt-1 block text-base text-dim">{m.label}</dt>
            <dd className="font-pixel text-xs text-yellow [text-shadow:0_0_8px_rgba(253,224,71,.5)]">
              {m.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8">
        {children ?? (
          <div className="font-pixel border-2 border-dashed border-purple/40 px-4 py-10 text-center text-[9px] text-dim">
            ▶ DEMO LOADS HERE
          </div>
        )}
      </div>
    </motion.div>
  );
}
