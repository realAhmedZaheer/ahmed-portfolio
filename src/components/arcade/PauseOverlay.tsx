"use client";
import { useEffect, useRef } from "react";

const CONTROLS: [string, string][] = [
  ["MOVE", "A / D  ·  ← →"],
  ["SOFT DROP", "S  ·  ↓"],
  ["ROTATE", "W / ↑ (CW)  ·  Z / Q (CCW)"],
  ["HARD DROP", "SPACE"],
  ["HOLD", "SHIFT / C"],
  ["POWERUPS", "1 LASER · 2 SLOW · 3 BOMB"],
  ["PAUSE", "ESC / P"],
];

export function PauseOverlay({ onResume, onExit }: { onResume(): void; onExit(): void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "p" || e.key === "P") {
        e.preventDefault();
        e.stopPropagation();
        onResume();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onResume]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Paused"
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-bg/85 px-6"
    >
      <p className="font-pixel text-sm text-cyan [text-shadow:0_0_12px_rgba(34,211,238,.6)]">// PAUSED</p>
      <div className="font-pixel w-full max-w-xs space-y-2 text-[8px]">
        {CONTROLS.map(([label, keys]) => (
          <div key={label} className="flex justify-between gap-4">
            <span className="text-dim">{label}</span>
            <span className="text-white">{keys}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          ref={ref}
          type="button"
          onClick={onResume}
          className="font-pixel gx pixel-corners border-2 border-cyan bg-cyan/10 px-5 py-3 text-[9px] text-cyan hover:bg-cyan hover:text-bg"
        >
          ▶ RESUME
        </button>
        <button
          type="button"
          onClick={onExit}
          className="font-pixel gx pixel-corners border-2 border-purple/60 px-5 py-3 text-[9px] text-white hover:border-white"
        >
          EXIT TO HUB
        </button>
      </div>
    </div>
  );
}
