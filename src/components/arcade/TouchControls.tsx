"use client";
import type { Action } from "@/lib/defrag/types";
import { POWERUPS } from "@/lib/defrag/powerups";

/** On-screen controls for coarse pointers (touch). Hidden on fine pointers via CSS. */
export function TouchControls({ dispatch }: { dispatch(a: Action): void }) {
  const btn = "font-pixel pixel-corners border-2 border-purple/50 bg-bg2/80 px-3 py-3 text-[10px] text-white active:bg-purple/30";
  return (
    <div className="hidden [@media(pointer:coarse)]:flex w-full items-end justify-between gap-2 px-2">
      <div className="grid grid-cols-3 gap-1">
        <span />
        <button type="button" aria-label="Rotate" className={btn} onClick={() => dispatch({ type: "ROTATE", dir: 1 })}>⟳</button>
        <span />
        <button type="button" aria-label="Left" className={btn} onClick={() => dispatch({ type: "MOVE", dir: -1 })}>←</button>
        <button type="button" aria-label="Soft drop" className={btn} onClick={() => dispatch({ type: "SOFT_DROP" })}>↓</button>
        <button type="button" aria-label="Right" className={btn} onClick={() => dispatch({ type: "MOVE", dir: 1 })}>→</button>
      </div>
      <div className="flex flex-col gap-1">
        <button type="button" aria-label="Hard drop" className={btn} onClick={() => dispatch({ type: "HARD_DROP" })}>⤓ DROP</button>
        <button type="button" aria-label="Hold" className={btn} onClick={() => dispatch({ type: "HOLD" })}>HOLD</button>
        <div className="flex gap-1">
          {POWERUPS.map((p) => (
            <button key={p.id} type="button" aria-label={p.label} className={btn} onClick={() => dispatch({ type: "USE_POWERUP", id: p.id })}>
              {p.key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
