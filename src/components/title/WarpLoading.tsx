"use client";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { isReducedMotion } from "@/lib/motionPref";
import { playSound } from "@/lib/sfx";

const STREAKS = 48;
const BITS = 36;
const STREAK_COLORS = [
  "rgba(168,85,247,.95)",
  "rgba(192,132,252,.95)",
  "rgba(236,72,153,.9)",
  "rgba(168,85,247,.95)",
  "rgba(216,180,254,.95)",
  "rgba(34,211,238,.85)",
];

const DEPTHS = [
  { start: "68vmax", width: "38vmax", hMin: 10, hSpan: 7, durMin: 0.85, z: 3 },
  { start: "56vmax", width: "28vmax", hMin: 6, hSpan: 4, durMin: 1.25, z: 2 },
  { start: "44vmax", width: "19vmax", hMin: 3, hSpan: 3, durMin: 1.7, z: 1 },
];

interface WarpLoadingProps {
  onComplete: () => void;
}

/**
 * Post-boot intro: chunky 8-bit pixel beams converging inward from three
 * parallax depth layers (with a slight perspective tilt) toward the screen
 * center - where the title logo is materializing (see TitleScreen's FLIP).
 * Skippable; reduced motion skips it entirely.
 */
export function WarpLoading({ onComplete }: WarpLoadingProps) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onCompleteRef.current();
  }, []);

  useEffect(() => {
    if (isReducedMotion()) {
      finish();
      return;
    }
    playSound("warp");
    const t = setTimeout(finish, 2500);
    return () => clearTimeout(t);
  }, [finish]);

  const streaks = useMemo(
    () =>
      Array.from({ length: STREAKS }, (_, i) => {
        const hash = (i * 2654435761) >>> 0;
        const depth = DEPTHS[hash % DEPTHS.length];
        return {
          angle: Math.round((360 / STREAKS) * i + (hash % 7)),
          color: STREAK_COLORS[hash % STREAK_COLORS.length],
          height: depth.hMin + (hash % depth.hSpan),
          solid: (hash >> 3) % 2 === 0,
          dur: depth.durMin + ((hash >> 4) % 4) / 10,
          delay: -(((hash >> 6) % 22) / 10),
          depth,
        };
      }),
    [],
  );

  const bits = useMemo(
    () =>
      Array.from({ length: BITS }, (_, i) => {
        const hash = ((i + 17) * 2654435761) >>> 0;
        const depth = DEPTHS[hash % DEPTHS.length];
        const size = depth.hMin + (hash % 8);
        return {
          angle: hash % 360,
          width: hash % 4 === 0 ? size * 2 : size,
          height: size,
          color: hash % 3 === 0 ? "rgba(186,230,253,.95)" : "rgba(216,180,254,.9)",
          dur: depth.durMin + 0.6 + ((hash >> 5) % 8) / 10,
          delay: -(((hash >> 7) % 26) / 10),
          depth,
        };
      }),
    [],
  );

  return (
    <div
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[100] overflow-hidden bg-[#070310]"
    >
      <div aria-hidden className="absolute inset-0" style={{ transform: "perspective(900px) rotateX(11deg)" }}>
        {streaks.map((s, i) => (
          <span
            key={`w${i}`}
            className={`warp-streak ${s.solid ? "warp-streak--solid" : "warp-streak--blocks"}`}
            style={
              {
                width: s.depth.width,
                zIndex: s.depth.z,
                "--a": `${s.angle}deg`,
                "--c": s.color,
                "--h": `${s.height}px`,
                "--start": s.depth.start,
                "--dur": `${s.dur}s`,
                "--delay": `${s.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
        {bits.map((b, i) => (
          <span
            key={`b${i}`}
            className="warp-bit"
            style={
              {
                width: b.width,
                height: b.height,
                background: b.color,
                zIndex: b.depth.z,
                "--a": `${b.angle}deg`,
                "--start": b.depth.start,
                "--dur": `${b.dur}s`,
                "--delay": `${b.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div aria-hidden className="font-pixel absolute inset-x-0 top-0 flex items-start justify-between px-6 py-5 text-[9px] leading-relaxed text-[#cfe6ff] sm:px-10">
        <span>
          PLAYER A<br />
          000000000
        </span>
        <span className="text-center">
          WORLD<br />
          1-1
        </span>
        <span className="text-right">
          TIME<br />
          00:00:00
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-[18%] flex flex-col items-center gap-5">
        <span className="font-pixel text-base text-[#e8f4ff] [text-shadow:0_0_12px_rgba(180,220,255,.7)]" aria-hidden>
          LOADING
          <span className="pop-in" style={{ animationDelay: "600ms" }}>.</span>
          <span className="pop-in" style={{ animationDelay: "1100ms" }}>.</span>
          <span className="pop-in" style={{ animationDelay: "1600ms" }}>.</span>
        </span>
        <span className="seg-bar" aria-hidden>
          {Array.from({ length: 10 }, (_, s) => (
            <i key={s} className="seg" style={{ animationDelay: `${250 + s * 180}ms` }} />
          ))}
        </span>
      </div>

      <button
        type="button"
        onClick={finish}
        className="font-pixel gx absolute bottom-6 right-6 z-10 border-2 border-[#cfe6ff]/50 px-3 py-2 text-[8px] text-[#cfe6ff] hover:bg-[#cfe6ff] hover:text-[#070310] sm:right-10"
      >
        SKIP ▶
      </button>

      <p aria-hidden className="font-pixel absolute inset-x-0 bottom-7 text-center text-[9px] text-[#b9a8e8]">
        © 2026 AHMED ZAHEER
      </p>
    </div>
  );
}
