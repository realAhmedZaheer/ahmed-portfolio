"use client";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { isReducedMotion } from "@/lib/motionPref";
import { playSound } from "@/lib/sfx";

const COLS = 48;
const ROWS = 27;
const SPARKS = [
  "rgba(34,211,238,.9)",
  "rgba(236,72,153,.85)",
  "rgba(253,224,71,.8)",
  "rgba(168,85,247,.85)",
];
const QUIET = ["#1a1030", "#241a3e", "#2a1d4a"];

interface PixelBurstLoaderProps {
  target: string;
  label: string;
}

/**
 * START transition: the screen unravels from the middle - each pixel
 * glitch-flickers, then dies to black, rippling outward so the edge of the
 * dissolve is a ring of glitched pixels. Then NOW LOADING fills, then we
 * navigate. Reduced motion navigates immediately.
 */
export function PixelBurstLoader({ target, label }: PixelBurstLoaderProps) {
  const router = useRouter();

  useEffect(() => {
    if (isReducedMotion()) {
      router.push(target);
      return;
    }
    playSound("warp");
    const t = setTimeout(() => router.push(target), 2450);
    return () => clearTimeout(t);
  }, [router, target]);

  const cells = useMemo(() => {
    const cx = (COLS - 1) / 2;
    const cy = (ROWS - 1) / 2;
    return Array.from({ length: COLS * ROWS }, (_, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const hash = (i * 2654435761) >>> 0;
      const dist = Math.hypot(col - cx, (row - cy) * (COLS / ROWS / 1.1));
      const delay = Math.round(dist * 30 + (hash % 70));
      const spark =
        hash % 100 < 55
          ? SPARKS[hash % SPARKS.length]
          : QUIET[hash % QUIET.length];
      return { delay, spark };
    });
  }, []);

  return (
    <div role="status" aria-label="Loading next screen" data-nav-overlay className="fixed inset-0 z-[100] overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {cells.map((cell, i) => (
          <span
            key={i}
            className="px-dissolve"
            style={
              {
                animationDelay: `${cell.delay}ms`,
                "--spark": cell.spark,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div
        className="pop-in absolute inset-0 flex flex-col items-center justify-center gap-5"
        style={{ animationDelay: "1250ms" }}
      >
        <span className="font-pixel text-sm text-cyan [text-shadow:0_0_12px_rgba(34,211,238,.6)]">
          NOW LOADING
        </span>
        <span className="loading-bar" aria-hidden>
          <i />
        </span>
        <span className="blink font-pixel text-[8px] text-dim">{label}</span>
      </div>
    </div>
  );
}
