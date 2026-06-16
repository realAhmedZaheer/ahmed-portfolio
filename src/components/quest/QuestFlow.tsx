"use client";
import { useState } from "react";
import { ForgeMinigame } from "@/components/quest/ForgeMinigame";
import { QuestResult } from "@/components/quest/QuestResult";
import { CategoryIcon } from "@/components/quest/CategoryIcon";
import { questCategories, type QuestCategory, type QuestSub } from "@/content/quest";
import { isReducedMotion } from "@/lib/motionPref";
import { playSound } from "@/lib/sfx";
import { cn } from "@/lib/cn";

type Step = "category" | "sub" | "forge" | "result";

/**
 * SIDE QUEST: pick a quest line, then a specialization, optionally add
 * specifics - the forge minigame "builds" the order, and the result delivers
 * a specialization-specific interactive demo, spec, loot and CTA.
 */
export function QuestFlow() {
  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState<QuestCategory | null>(null);
  const [sub, setSub] = useState<QuestSub | null>(null);
  const [specific, setSpecific] = useState("");

  const begin = (chosen: QuestSub) => {
    setSub(chosen);
    playSound("confirm");
    // Reduced motion skips the minigame - straight to the goods.
    setStep(isReducedMotion() ? "result" : "forge");
  };

  const pickCategory = (c: QuestCategory) => {
    setCategory(c);
    playSound("move");
    if (c.subs.length === 1) {
      // "surprise me" has nothing to specify - straight to the forge
      begin(c.subs[0]);
    } else {
      setStep("sub");
    }
  };

  const reset = () => {
    playSound("back");
    setStep("category");
    setCategory(null);
    setSub(null);
    setSpecific("");
  };

  if (step === "result" && category && sub) {
    return (
      <QuestResult
        category={category}
        sub={sub}
        specific={specific.trim()}
        onReset={reset}
      />
    );
  }

  if (step === "forge" && sub) {
    return (
      <div>
        <p className="font-term mb-4 text-xl text-dim">
          Forging <span className="text-cyan">{sub.label}</span>
          {specific.trim() && (
            <>
              {" "}
              - “<span className="text-white">{specific.trim()}</span>”
            </>
          )}
        </p>
        <ForgeMinigame key={sub.id} parts={sub.parts} onComplete={() => setStep("result")} />
      </div>
    );
  }

  if (step === "sub" && category) {
    return (
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => {
            playSound("back");
            setStep("category");
            setSub(null);
          }}
          className="font-pixel gx mb-5 text-[8px] text-dim hover:text-white"
        >
          ◀ BACK
        </button>

        <p className="font-term text-2xl text-cyan">{category.label}</p>
        <p className="font-term mt-1 text-lg text-dim">
          Get specific - what flavor are we forging?
        </p>

        <div className="mt-6 space-y-2" role="radiogroup" aria-label="Pick a specialization">
          {category.subs.map((s) => {
            const active = sub?.id === s.id;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  setSub(s);
                  playSound("move");
                }}
                className={cn(
                  "gx-row flex w-full items-baseline gap-3 border-2 px-4 py-3.5 text-left",
                  active
                    ? "border-cyan bg-cyan/10 text-yellow"
                    : "border-purple/40 text-white hover:border-purple hover:text-yellow",
                )}
              >
                <span
                  aria-hidden
                  className={cn("font-pixel w-4 text-[10px] text-cyan", active ? "blink" : "opacity-0")}
                >
                  ▶
                </span>
                <span className="font-pixel text-[10px]">{s.label}</span>
                <span className="font-term ml-auto text-base text-dim">{s.sub}</span>
              </button>
            );
          })}
        </div>

        {/* optional specifics */}
        <label className="mt-6 block">
          <span className="font-pixel text-[8px] text-dim">ANYTHING SPECIFIC? (OPTIONAL)</span>
          <input
            value={specific}
            onChange={(e) => setSpecific(e.target.value)}
            maxLength={120}
            placeholder="e.g. a RAG service over our support docs…"
            className="font-term mt-2 w-full border-b-2 border-purple/40 bg-transparent pb-1 text-xl text-white outline-none placeholder:text-dim/60 focus:border-cyan"
          />
        </label>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => sub && begin(sub)}
            disabled={!sub}
            className={cn(
              "font-pixel gx pixel-corners inline-flex items-center gap-3 border-2 px-7 py-4 text-[11px]",
              sub
                ? "border-cyan bg-cyan/10 text-cyan [box-shadow:0_0_18px_rgba(34,211,238,.35)] hover:bg-cyan hover:text-bg"
                : "cursor-not-allowed border-dim/40 text-dim",
            )}
          >
            <span className={cn(sub && "blink")} aria-hidden>▶</span>
            FORGE IT
          </button>
          {!sub && (
            <p className="font-pixel mt-3 text-[7px] text-dim">PICK A SPECIALIZATION FIRST</p>
          )}
        </div>
      </div>
    );
  }

  // step === "category"
  return (
    <div className="mx-auto max-w-2xl">
      <p className="font-term text-2xl text-cyan">What are you looking to build?</p>
      <p className="font-term mt-1 text-lg text-dim">
        Pick a quest line - the forge assembles a demo to match.
      </p>

      <div className="mt-7 space-y-2">
        {questCategories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => pickCategory(c)}
            className="gx-row group flex w-full items-center gap-3 border-2 border-purple/40 px-4 py-3.5 text-left text-white hover:border-cyan hover:text-yellow"
          >
            <span
              aria-hidden
              className="font-pixel w-3 shrink-0 text-[10px] text-cyan opacity-0 group-hover:opacity-100"
            >
              ▶
            </span>
            <CategoryIcon
              id={c.id}
              className="size-5 shrink-0 text-purple group-hover:text-cyan"
            />
            <span className="font-pixel text-[10px]">{c.label}</span>
            <span className="font-term ml-auto text-base text-dim">{c.sub}</span>
          </button>
        ))}
      </div>

      <p className="font-pixel mt-6 text-center text-[7px] text-dim">
        STEP 1/2 - A SPECIALIZATION SCREEN FOLLOWS
      </p>
    </div>
  );
}
