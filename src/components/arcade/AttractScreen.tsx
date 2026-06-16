"use client";
import { PIECE_COLORS } from "@/lib/defrag/pieces";

/** Looping attract-mode: a few colored fragments drifting down the cabinet screen. */
export function AttractScreen() {
  const cols = Object.values(PIECE_COLORS);
  return (
    <div aria-hidden className="relative h-full min-h-28 w-full overflow-hidden bg-[#05030d]">
      <div
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: "linear-gradient(rgba(124,108,180,.25) 1px,transparent 1px)", backgroundSize: "100% 12px" }}
      />
      {cols.map((c, i) => (
        <span
          key={i}
          className="defrag-attract absolute h-3 w-3"
          style={{ left: `${8 + i * 13}%`, background: c, animationDelay: `${i * 0.4}s` }}
        />
      ))}
    </div>
  );
}
