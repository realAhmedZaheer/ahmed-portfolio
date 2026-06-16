"use client";
import { useState } from "react";
import { UPGRADES, getBits, levelOf, nextCost, buyUpgrade } from "@/lib/defrag/meta";
import { unlock } from "@/lib/achievements";
import { playSound } from "@/lib/sfx";

/**
 * TERMINAL SUPPLY - the black-market upgrade shop. Boot-sequence aesthetic
 * (term green on dark). Spend bits on persistent upgrades that fold into every
 * future run. (creative-direction - "The Meta-Shop: TERMINAL SUPPLY")
 */
export function UpgradeTerminal({ onExit, onPlay }: { onExit(): void; onPlay(): void }) {
  const [, force] = useState(0);
  const bits = getBits();

  const buy = (id: string) => {
    if (buyUpgrade(id)) {
      playSound("confirm");
      unlock("defrag-upgrade");
      force((n) => n + 1);
    }
  };

  const allMaxed = UPGRADES.every((u) => levelOf(u.id) >= u.costs.length);

  return (
    <section className="mx-auto w-full max-w-2xl px-5 py-12 font-term text-term">
      <p className="font-pixel text-sm text-term [text-shadow:0_0_10px_rgba(124,255,178,.5)]">&gt; TERMINAL SUPPLY</p>
      <p className="font-pixel mt-3 text-[10px] text-yellow">&gt; BITS: {bits.toLocaleString()}</p>

      <ul className="mt-8 space-y-4">
        {UPGRADES.map((u) => {
          const lvl = levelOf(u.id);
          const max = u.costs.length;
          const cost = nextCost(u.id);
          const maxed = cost === null;
          const tiered = max > 1;
          const afford = cost !== null && bits >= cost;
          return (
            <li key={u.id} className="border-b border-term/15 pb-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-pixel text-[9px] text-term">{u.path}</span>
                <span className="font-pixel text-[8px] text-dim">
                  {tiered && <span className="mr-2 text-cyan">LV {lvl}/{max}</span>}
                  {maxed ? "" : `${cost} ⛁`}
                </span>
              </div>
              <p className="mt-1 text-lg leading-snug text-dim">{u.flavor}</p>
              <div className="mt-2">
                {maxed ? (
                  <span className="font-pixel text-[8px] text-yellow">[OWNED]</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => buy(u.id)}
                    disabled={!afford}
                    aria-label={`Buy ${u.path}`}
                    className={`font-pixel gx text-[9px] ${afford ? "text-term hover:text-white" : "cursor-not-allowed text-dim/40"}`}
                  >
                    ▶ BUY
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {allMaxed && (
        <p className="font-pixel mt-6 text-[9px] text-yellow [text-shadow:0_0_8px_rgba(253,224,71,.5)]">
          &gt; SUPPLY EXHAUSTED. YOU HAVE EVERYTHING.
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-5">
        <button
          type="button"
          onClick={onPlay}
          className="font-pixel gx pixel-corners border-2 border-cyan bg-cyan/10 px-5 py-3 text-[9px] text-cyan hover:bg-cyan hover:text-bg"
        >
          ▶ INSERT COIN
        </button>
        <button type="button" onClick={onExit} className="font-pixel gx text-[8px] text-dim hover:text-white">
          ▶ BACK TO CABINET
        </button>
      </div>
    </section>
  );
}
