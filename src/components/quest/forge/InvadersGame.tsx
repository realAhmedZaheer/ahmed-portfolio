"use client";
import { useEffect, useRef, useState } from "react";
import { InvaderSprite } from "@/components/fx/InvaderSprite";
import { playSound } from "@/lib/sfx";
import { ForgeChrome, CompilingOverlay, FORGE_COLORS, forgeArenaClass } from "./ForgeChrome";
import { useForge } from "./useForge";

interface Bullet { id: number; x: number; y: number }
interface Boom { id: number; x: number; y: number; ttl: number }
interface State {
  ship: number;
  bullets: Bullet[];
  offset: number;
  dir: 1 | -1;
  booms: Boom[];
  lastFire: number;
  seq: number;
}

const slotFor = (i: number, offset: number) => ({
  x: 18 + (i % 3) * 28 + offset,
  y: 10 + Math.floor(i / 3) * 26,
});

/** Component Invaders: the parts ride marching invaders - shoot or tap them. */
export function InvadersGame({ parts, onComplete }: { parts: string[]; onComplete: () => void }) {
  const { collected, collect, got, compiling, skip } = useForge(parts.length, onComplete);
  const collectedRef = useRef(collected);
  collectedRef.current = collected;
  const s = useRef<State>({ ship: 50, bullets: [], offset: 0, dir: 1, booms: [], lastFire: 0, seq: 0 });
  const [, render] = useState(0);

  const fire = (st: State) => {
    const now = Date.now();
    if (now - st.lastFire < 220 || st.bullets.length >= 4) return;
    st.lastFire = now;
    st.bullets.push({ id: st.seq++, x: st.ship, y: 8 });
    playSound("hover");
  };

  useEffect(() => {
    const iv = setInterval(() => {
      const st = s.current;
      const alive = collectedRef.current;
      st.offset += st.dir * 0.65;
      if (st.offset > 9 || st.offset < -9) st.dir = (st.dir * -1) as 1 | -1;
      st.bullets = st.bullets.filter((b) => {
        b.y += 5.5;
        if (b.y > 102) return false;
        const bTop = 100 - b.y;
        for (let i = 0; i < parts.length; i++) {
          if (alive[i]) continue;
          const p = slotFor(i, st.offset);
          if (Math.abs(b.x - p.x) < 11 && Math.abs(bTop - (p.y + 7)) < 10) {
            st.booms.push({ id: st.seq++, x: p.x, y: p.y, ttl: 8 });
            collect(i);
            return false;
          }
        }
        return true;
      });
      st.booms = st.booms.filter((bm) => --bm.ttl > 0);
      render((r) => r + 1);
    }, 50);
    return () => clearInterval(iv);
  }, [parts.length, collect]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const st = s.current;
      if (e.key === "ArrowLeft" || e.key === "a") { e.preventDefault(); st.ship = Math.max(4, st.ship - 4); }
      else if (e.key === "ArrowRight" || e.key === "d") { e.preventDefault(); st.ship = Math.min(96, st.ship + 4); }
      else if (e.key === " " || e.key === "ArrowUp") { e.preventDefault(); fire(st); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const st = s.current;

  return (
    <ForgeChrome
      title="COMPONENT INVADERS"
      parts={parts}
      got={got}
      onSkip={skip}
      controlsHint="← → MOVE · SPACE / CLICK FIRE · OR TAP AN INVADER"
    >
      <div
        role="group"
        aria-label="Component invaders - shoot or tap the parts to collect them"
        className={`${forgeArenaClass} cursor-aim border-cyan/30 bg-[#070310]/85`}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          st.ship = Math.min(96, Math.max(4, ((e.clientX - r.left) / r.width) * 100));
        }}
        onPointerDown={() => fire(st)}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(rgba(168,85,247,.3) 1px, transparent 1px)", backgroundSize: "16px 16px" }}
        />

        {parts.map((part, i) => {
          if (collected[i]) return null;
          const p = slotFor(i, st.offset);
          return (
            <button
              key={part}
              type="button"
              aria-label={`Shoot ${part}`}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); collect(i); }}
              className="absolute -translate-x-1/2 cursor-crosshair text-center"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <InvaderSprite className="mx-auto h-auto w-9 sm:w-11" fill={FORGE_COLORS[i % FORGE_COLORS.length]} />
              <span className="font-pixel mt-1 block text-[7px]" style={{ color: FORGE_COLORS[i % FORGE_COLORS.length] }}>
                {part}
              </span>
            </button>
          );
        })}

        {st.booms.map((bm) => (
          <span key={bm.id} aria-hidden className="pop-in font-pixel absolute -translate-x-1/2 text-sm text-white [text-shadow:0_0_10px_var(--yellow)]" style={{ left: `${bm.x}%`, top: `${bm.y + 3}%` }}>
            ✸
          </span>
        ))}

        {st.bullets.map((b) => (
          <span key={b.id} aria-hidden className="absolute h-3 w-[3px] bg-cyan [box-shadow:0_0_6px_var(--cyan)]" style={{ left: `${b.x}%`, bottom: `${b.y}%` }} />
        ))}

        <div aria-hidden className="absolute bottom-2 -translate-x-1/2" style={{ left: `${st.ship}%` }}>
          <div className="h-4 w-7 bg-cyan [box-shadow:0_0_12px_rgba(34,211,238,.7)]" style={{ clipPath: "polygon(50% 0, 100% 100%, 78% 70%, 22% 70%, 0 100%)" }} />
        </div>

        <CompilingOverlay show={compiling} />
      </div>
    </ForgeChrome>
  );
}
