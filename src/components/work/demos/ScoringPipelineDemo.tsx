"use client";
import { useState } from "react";
import { weightedScore, type Stage, type SampleScores } from "@/lib/scoring";
import { playSound } from "@/lib/sfx";
import { cn } from "@/lib/cn";

interface Sample {
  id: string;
  label: string;
  scores: SampleScores;
}

interface ScoringPipelineDemoProps {
  stages: Stage[];
  samples: Sample[];
}

/** Interactive demo of the dataset-quality analyzer with weighted multi-metric scoring. */
export function ScoringPipelineDemo({ stages, samples }: ScoringPipelineDemoProps) {
  const [idx, setIdx] = useState(0);
  const sample = samples[idx];
  const score = weightedScore(stages, sample.scores);
  const verdict = score >= 75 ? "PASS" : score >= 45 ? "REVIEW" : "REJECT";
  const verdictColor =
    score >= 75 ? "text-term" : score >= 45 ? "text-yellow" : "text-pink";

  return (
    <div className="pixel-corners border-2 border-cyan/30 bg-[#070310]/80 p-4 sm:p-5">
      <div className="font-pixel mb-3 text-[9px] text-cyan">
        ▶ DATASET QUALITY ANALYZER
        <span className="ml-2 text-dim">- pick a sample</span>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {samples.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setIdx(i);
              playSound("move");
            }}
            aria-pressed={i === idx}
            className={cn(
              "font-term gx border px-2 py-1 text-base",
              i === idx
                ? "border-cyan bg-cyan/15 text-cyan"
                : "border-purple/40 text-dim hover:text-white",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <ul className="space-y-2.5">
        {stages.map((st) => {
          const v = sample.scores[st.key] ?? 0;
          const pct = Math.round(v * 100);
          return (
            <li key={st.key} className="flex items-center gap-3">
              <span className="font-term w-44 shrink-0 text-base text-[#c8bff0]">
                {st.label}
              </span>
              <span className="h-2.5 flex-1 border border-purple/40 bg-black/40 p-[2px]">
                <span
                  className="block h-full bg-gradient-to-r from-cyan to-purple transition-[width] duration-700 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="font-pixel w-8 shrink-0 text-right text-[8px] text-cyan">
                {pct}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex items-end justify-between border-t-2 border-dashed border-purple/30 pt-4">
        <div>
          <div className="font-pixel text-[8px] text-dim">QUALITY SCORE</div>
          <div
            key={sample.id}
            className="pop-in font-pixel text-2xl text-yellow [text-shadow:0_0_10px_rgba(253,224,71,.45)]"
          >
            {score}
            <span className="text-sm text-dim">/100</span>
          </div>
        </div>
        <div
          key={`${sample.id}-v`}
          className={cn("pop-in font-pixel pixel-corners border-2 px-3 py-2 text-[10px]", verdictColor,
            score >= 75 ? "border-term/60" : score >= 45 ? "border-yellow/60" : "border-pink/60")}
        >
          {verdict}
        </div>
      </div>

      <p className="font-term mt-3 text-sm text-dim">
        SigLIP · DETR · Laplacian sharpness · cosine dedup · face cluster -
        weighted into one score. Illustrative samples.
      </p>
    </div>
  );
}
