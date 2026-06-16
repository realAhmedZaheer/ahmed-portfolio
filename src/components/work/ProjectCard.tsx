"use client";
import { GlitchText } from "@/components/fx/GlitchText";
import { PixelIcon } from "@/components/work/PixelIcon";
import { playSound } from "@/lib/sfx";
import type { ProjectCard as ProjectCardData } from "@/types/content";

interface ProjectCardProps {
  project: ProjectCardData;
  index: number;
}

/** Neon palette per tech chip - drives the card's pixel-icon tint. */
const TECH_COLOR: Record<string, string> = {
  Gemini: "var(--cyan)",
  OpenAI: "var(--term-green)",
  Caching: "var(--yellow)",
  Node: "var(--term-green)",
  MongoDB: "var(--term-green)",
  Aggregation: "var(--cyan)",
  "Next.js": "var(--white)",
  ISR: "var(--yellow)",
  Reliability: "var(--pink)",
  TypeScript: "var(--cyan)",
  Diffusion: "var(--purple)",
  NestJS: "var(--pink)",
  GPU: "var(--yellow)",
  Redis: "var(--pink)",
  Docker: "var(--cyan)",
  CUDA: "var(--term-green)",
  Expo: "var(--purple)",
};

/** Pick a thumbnail tint from the card's first tech, defaulting to cyan. */
function iconColor(tech: string[]): string {
  return TECH_COLOR[tech[0]] ?? "var(--cyan)";
}

/** Level-select card: pixel-notched frame, hover glitch title, tech chips. */
export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <article
      onMouseEnter={() => playSound("hover")}
      className="group gx-card pixel-corners relative flex h-full flex-col border-2 border-purple/50 bg-gradient-to-br from-bg2 to-[#0a0716] p-5 hover:border-cyan hover:[box-shadow:0_0_22px_rgba(34,211,238,.25)]"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <PixelIcon
          glyphId={project.id}
          fill={iconColor(project.tech)}
          className="shrink-0 [filter:drop-shadow(0_0_5px_currentColor)]"
        />
        <span aria-hidden className="font-pixel shrink-0 text-[8px] text-yellow/80">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <GlitchText
        text={project.title}
        as="h4"
        className="glitch--hover mb-3 block text-[10px] leading-relaxed text-white sm:text-[11px]"
      />
      <p className="font-term flex-1 text-lg leading-snug text-[#c8bff0]">
        {project.blurb}
      </p>
      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
        {project.tech.map((t) => (
          <li
            key={t}
            className="font-pixel border border-purple/60 bg-purple/15 px-1.5 py-1 text-[7px] text-cyan"
          >
            {t}
          </li>
        ))}
      </ul>
    </article>
  );
}
