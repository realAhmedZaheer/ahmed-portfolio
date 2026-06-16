"use client";
import { motion } from "framer-motion";
import { Section } from "@/components/layout/Section";
import { CaseStudy } from "@/components/work/CaseStudy";
import { ProjectCard } from "@/components/work/ProjectCard";
import type { WorkPillar as WorkPillarData } from "@/types/content";

interface WorkPillarProps {
  pillar: WorkPillarData;
  num: string;
  demo?: React.ReactNode;
}

/** One work pillar: boss case study + level-select grid of project cards. */
export function WorkPillar({ pillar, num, demo }: WorkPillarProps) {
  return (
    <Section id={pillar.id} num={num} gameName={pillar.gameName} srLabel={pillar.label}>
      <CaseStudy study={pillar.boss}>{demo}</CaseStudy>

      <h3 aria-hidden className="font-pixel mb-5 mt-12 text-[10px] text-pink">
        <span className="blink inline-block">▶</span>&nbsp;LEVEL SELECT
      </h3>
      <h3 className="sr-only">More projects</h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pillar.cards.map((card, i) => (
          /* hard sequential pop - no slide, game menus appear frame by frame */
          <motion.div
            key={card.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0, delay: i * 0.07 }}
          >
            <ProjectCard project={card} index={i} />
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
