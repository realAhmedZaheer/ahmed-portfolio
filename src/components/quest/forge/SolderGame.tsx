"use client";
import { useEffect, useRef, useState } from "react";
import { ForgeChrome, CompilingOverlay, FORGE_COLORS, forgeArenaClass } from "./ForgeChrome";
import { useForge } from "./useForge";

/** Solder the Board: parts are chips on a board - click to solder; traces light between them. */
export function SolderGame({ parts, onComplete }: { parts: string[]; onComplete: () => void }) {
  const { collected, collect, got, compiling, skip } = useForge(parts.length, onComplete);
  const [order, setOrder] = useState<number[]>([]);
  const [scan, setScan] = useState(8);
  const scanDir = useRef<1 | -1>(1);

  const positions = useRef(
    parts.map((_, i) => {
      const hash = ((i + 5) * 2654435761) >>> 0;
      return { x: 14 + (hash % 68), y: 16 + ((hash >> 4) % 60) };
    }),
  ).current;

  useEffect(() => {
    const iv = setInterval(() => {
      setScan((p) => {
        let n = p + scanDir.current * 1.6;
        if (n > 92) { n = 92; scanDir.current = -1; }
        else if (n < 8) { n = 8; scanDir.current = 1; }
        return n;
      });
    }, 40);
    return () => clearInterval(iv);
  }, []);

  const solder = (i: number) => {
    if (collected[i]) return;
    setOrder((o) => [...o, i]);
    collect(i);
  };

  return (
    <ForgeChrome
      title="SOLDER THE BOARD"
      parts={parts}
      got={got}
      onSkip={skip}
      controlsHint="CLICK / TAP EACH CHIP TO SOLDER IT IN"
    >
      <div
        role="group"
        aria-label="Solder the board - click each chip to solder it"
        className={`${forgeArenaClass} cursor-aim border-term/30 bg-[#04100a]/85`}
      >
        <div aria-hidden className="absolute inset-0 opacity-25" style={{ backgroundImage: "linear-gradient(rgba(124,255,178,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(124,255,178,.2) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

        <div aria-hidden className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-term/15 to-transparent" style={{ left: `${scan}%` }} />

        <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {order.slice(1).map((cur, k) => {
            const prev = positions[order[k]];
            const here = positions[cur];
            return (
              <line key={k} x1={prev.x} y1={prev.y} x2={here.x} y2={here.y} stroke="var(--term)" strokeWidth={0.6} strokeDasharray="2 1.5" opacity={0.7} />
            );
          })}
        </svg>

        {parts.map((part, i) => {
          const done = collected[i];
          return (
            <button
              key={part}
              type="button"
              aria-label={`Solder ${part}`}
              onClick={() => solder(i)}
              disabled={done}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer text-center"
              style={{ left: `${positions[i].x}%`, top: `${positions[i].y}%` }}
            >
              <span
                className={done ? "" : "blink"}
                style={{ display: "block" }}
              >
                <span
                  className="font-pixel inline-block border-2 px-2 py-1.5 text-[8px]"
                  style={
                    done
                      ? { borderColor: "var(--term)", background: "rgba(124,255,178,.15)", color: "var(--term)" }
                      : { borderColor: FORGE_COLORS[i % FORGE_COLORS.length], color: FORGE_COLORS[i % FORGE_COLORS.length] }
                  }
                >
                  {done ? "▣ " : "◌ "}
                  {part}
                </span>
              </span>
            </button>
          );
        })}

        <CompilingOverlay show={compiling} />
      </div>
    </ForgeChrome>
  );
}
