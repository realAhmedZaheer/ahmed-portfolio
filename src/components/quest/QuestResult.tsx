"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { unlock } from "@/lib/achievements";
import { isReducedMotion } from "@/lib/motionPref";
import { RevealItem } from "@/components/motion/Reveal";
import { AgentToolCallDemo } from "@/components/work/demos/AgentToolCallDemo";
import { ScoringPipelineDemo } from "@/components/work/demos/ScoringPipelineDemo";
import { RagRetrievalDemo } from "@/components/quest/demos/RagRetrievalDemo";
import { StreamChatDemo } from "@/components/quest/demos/StreamChatDemo";
import { WorkerOrchestratorDemo } from "@/components/quest/demos/WorkerOrchestratorDemo";
import { DashboardDemo } from "@/components/quest/demos/DashboardDemo";
import { ApiPlaygroundDemo } from "@/components/quest/demos/ApiPlaygroundDemo";
import { GlitchText } from "@/components/fx/GlitchText";
import { agentScenarios, scoringStages, scoringSamples } from "@/content/demos";
import type { QuestCategory, QuestSub, QuestDemoKind } from "@/content/quest";

/** Stagger container for the result body - waits for the heading glitch-flash
    (~0.32s) to land, then streams the spec → demo → CTA in one after another. */
const bodyStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.34 } },
};

function demoFor(kind: QuestDemoKind) {
  switch (kind) {
    case "agent-tool-call":
      return <AgentToolCallDemo scenarios={agentScenarios} />;
    case "scoring-pipeline":
      return <ScoringPipelineDemo stages={scoringStages} samples={scoringSamples} />;
    case "rag-retrieval":
      return <RagRetrievalDemo />;
    case "stream-chat":
      return <StreamChatDemo />;
    case "worker-orchestrator":
      return <WorkerOrchestratorDemo />;
    case "dashboard":
      return <DashboardDemo />;
    case "api-playground":
      return <ApiPlaygroundDemo />;
  }
}

interface QuestResultProps {
  category: QuestCategory;
  sub: QuestSub;
  specific: string;
  onReset: () => void;
}

/** The forged order: BUILD SPEC, the specialization demo, and the CTA. */
export function QuestResult({ category, sub, specific, onReset }: QuestResultProps) {
  const mailSubject = encodeURIComponent(
    `Let's build: ${specific || sub.label.toLowerCase()}`,
  );

  // Snapshot the motion pref once on mount so the sequence is decided up front.
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(isReducedMotion());
    unlock("side-quest");
  }, []);

  // The header line under the glitch heading.
  const headerMeta = (
    <p className="font-term mt-3 text-xl text-cyan">
      {category.label} <span className="text-dim">▸</span> {sub.label}
      {specific && (
        <span className="text-dim">
          {" "}
          - “<span className="text-white">{specific}</span>”
        </span>
      )}
    </p>
  );

  const buildSpec = (
    <div className="pixel-corners border-2 border-yellow/40 bg-black/30 p-5">
      <p className="font-pixel mb-4 text-[9px] text-yellow">▶ BUILD SPEC</p>
      <ul className="space-y-2.5">
        {sub.spec.map((line) => (
          <li key={line} className="font-term text-xl leading-snug text-[#c8bff0]">
            <span aria-hidden className="mr-2 text-cyan">▶</span>
            {line}
          </li>
        ))}
      </ul>
    </div>
  );

  const demoBlock = (
    <div>
      <p className="font-pixel mb-3 text-[9px] text-pink">▶ YOUR DEMO - PLAYABLE</p>
      {demoFor(sub.demo)}
    </div>
  );

  const cta = (
    <div className="pixel-corners border-2 border-cyan/40 bg-cyan/5 p-6 text-center">
      <p className="font-pixel text-[11px] text-white">WANT THIS BUILT FOR REAL?</p>
      <p className="font-term mt-2 text-xl text-dim">
        The forge was a toy - the work above is not. Tell me what you’re building.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <a
          href={`mailto:ahmedzaheer9000@gmail.com?subject=${mailSubject}`}
          className="font-pixel gx pixel-corners inline-flex items-center gap-3 border-2 border-cyan bg-cyan/10 px-6 py-4 text-[10px] text-cyan [box-shadow:0_0_18px_rgba(34,211,238,.35)] hover:bg-cyan hover:text-bg"
        >
          <span className="blink" aria-hidden>▶</span>
          EMAIL ME
        </a>
        <a
          href="/Ahmed-Zaheer-Resume.pdf"
          className="font-pixel gx pixel-corners inline-flex items-center gap-3 border-2 border-yellow/60 bg-yellow/10 px-6 py-4 text-[10px] text-yellow hover:bg-yellow hover:text-bg"
        >
          RESUME
        </a>
        <Link
          href="/contact"
          className="font-pixel gx pixel-corners inline-flex items-center gap-3 border-2 border-purple/60 px-6 py-4 text-[10px] text-white hover:border-white"
        >
          CONTINUE?
        </Link>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="font-pixel gx mt-5 text-[8px] text-dim hover:text-white"
      >
        ↺ FORGE ANOTHER
      </button>
    </div>
  );

  // Reduced motion: render everything immediately, no stagger, no flash.
  if (reduced) {
    return (
      <div className="space-y-10">
        <div className="text-center">
          <GlitchText text="ORDER COMPLETE" as="p" className="text-lg text-white sm:text-2xl" />
          {headerMeta}
        </div>
        {buildSpec}
        {demoBlock}
        {cta}
      </div>
    );
  }

  // Full motion: the heading glitch-flashes in first (quick), THEN the spec,
  // demo and CTA reveal in sequence via the delayed body stagger.
  return (
    <div className="space-y-10">
      {/* order header - glitch-flashes in ahead of the rest */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.4, 1] }}
        transition={{ duration: 0.32, times: [0, 0.4, 0.6, 1], ease: "linear" }}
      >
        <GlitchText text="ORDER COMPLETE" as="p" className="text-lg text-white sm:text-2xl" />
        {headerMeta}
      </motion.div>

      {/* the rest streams in, staggered, once the heading flash has played */}
      <motion.div
        className="space-y-10"
        variants={bodyStagger}
        initial="hidden"
        animate="show"
      >
        <RevealItem>{buildSpec}</RevealItem>
        <RevealItem>{demoBlock}</RevealItem>
        <RevealItem>{cta}</RevealItem>
      </motion.div>
    </div>
  );
}
