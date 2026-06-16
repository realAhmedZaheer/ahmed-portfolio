"use client";
import { useEffect, useRef, useState } from "react";
import { ForgeChrome, CompilingOverlay, FORGE_COLORS, forgeArenaClass } from "./ForgeChrome";
import { useForge } from "./useForge";

interface Drop { x: number; y: number; speed: number }

/** Catch the Drop: parts fall from the top - slide the collector to catch them (or tap). */
export function CatchGame({ parts, onComplete }: { parts: string[]; onComplete: () => void }) {
  const { collected, collect, got, compiling, skip } = useForge(parts.length, onComplete);
  const collectedRef = useRef(collected);
  collectedRef.current = collected;
  const dropsRef = useRef<Drop[]>(
    parts.map((_, i) => ({
      x: parts.length > 1 ? 8 + (i * 84) / (parts.length - 1) : 50,
      y: -12 - i * 24,
      speed: 0.85 + (i % 3) * 0.22,
    })),
  );
  const tray = useRef(50);
  const [, render] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      const drops = dropsRef.current;
      const done = collectedRef.current;
      for (let i = 0; i < parts.length; i++) {
        if (done[i]) continue;
        const d = drops[i];
        d.y += d.speed;
        if (d.y >= 82 && d.y <= 95 && Math.abs(d.x - tray.current) < 13) {
          collect(i);
        } else if (d.y > 104) {
          d.y = -8;
          d.x = 8 + Math.random() * 84;
        }
      }
      render((r) => r + 1);
    }, 50);
    return () => clearInterval(iv);
  }, [parts.length, collect]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft" || e.key === "a") { e.preventDefault(); tray.current = Math.max(8, tray.current - 5); }
      else if (e.key === "ArrowRight" || e.key === "d") { e.preventDefault(); tray.current = Math.min(92, tray.current + 5); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <ForgeChrome
      title="CATCH THE DROP"
      parts={parts}
      got={got}
      onSkip={skip}
      controlsHint="← → MOVE COLLECTOR · OR TAP A FALLING PART"
    >
      <div
        role="group"
        aria-label="Catch the drop - move the collector under falling parts, or tap them"
        className={`${forgeArenaClass} cursor-aim border-pink/30 bg-[#0d0612]/85`}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          tray.current = Math.min(92, Math.max(8, ((e.clientX - r.left) / r.width) * 100));
        }}
      >
        <div aria-hidden className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(rgba(236,72,153,.3) 1px, transparent 1px)", backgroundSize: "15px 15px" }} />

        {parts.map((part, i) => {
          if (collected[i]) return null;
          const d = dropsRef.current[i];
          return (
            <button
              key={part}
              type="button"
              aria-label={`Catch ${part}`}
              onClick={() => collect(i)}
              className="font-pixel absolute -translate-x-1/2 cursor-pointer border-2 bg-bg2/90 px-2 py-1.5 text-[8px]"
              style={{ left: `${d.x}%`, top: `${Math.max(-6, d.y)}%`, borderColor: FORGE_COLORS[i % FORGE_COLORS.length], color: FORGE_COLORS[i % FORGE_COLORS.length] }}
            >
              {part}
            </button>
          );
        })}

        <div aria-hidden className="absolute bottom-3 -translate-x-1/2" style={{ left: `${tray.current}%` }}>
          <div className="h-2.5 w-16 rounded-sm bg-gradient-to-r from-cyan to-pink [box-shadow:0_0_12px_rgba(236,72,153,.55)]" />
          <div className="mx-auto mt-0.5 h-2 w-10 border-x-2 border-b-2 border-pink/60" />
        </div>

        <CompilingOverlay show={compiling} />
      </div>
    </ForgeChrome>
  );
}
