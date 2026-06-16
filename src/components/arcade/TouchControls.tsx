"use client";
import type { Action } from "@/lib/defrag/types";
import { POWERUPS, canAfford } from "@/lib/defrag/powerups";
import { cn } from "@/lib/cn";

/** Mobile powerup buttons. Move/rotate/drop/hold are touch gestures (see useTouchControls). */
export function TouchControls({ charge, dispatch }: { charge: number; dispatch(a: Action): void }) {
  return (
    <div className="flex w-full items-stretch justify-center gap-2 px-2">
      {POWERUPS.map((p) => {
        const ok = canAfford(charge, p.id);
        return (
          <button
            key={p.id}
            type="button"
            aria-label={`${p.label}, costs ${p.cost}`}
            disabled={!ok}
            onClick={() => dispatch({ type: "USE_POWERUP", id: p.id })}
            className={cn(
              "font-pixel pixel-corners flex flex-1 flex-col items-center gap-0.5 border-2 px-2 py-2 text-[8px] leading-tight active:translate-y-px",
              ok ? "border-pink/60 bg-bg2/80 text-white" : "border-purple/30 bg-bg2/40 text-dim/50",
            )}
          >
            <span className="text-[10px] text-pink">{p.key}</span>
            <span>{p.label}</span>
            <span className="text-dim">·{p.cost}</span>
          </button>
        );
      })}
    </div>
  );
}
