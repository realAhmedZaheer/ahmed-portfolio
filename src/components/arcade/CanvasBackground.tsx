"use client";
import { useEffect, useRef } from "react";
import { isReducedMotion } from "@/lib/motionPref";
import { getMusic } from "@/lib/defrag/music";
import type { BgPulseKind, BgProps } from "./bgShared";

type RGB = [number, number, number];
function hexToRGB(hex: string): RGB {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}
function lerpRGB(a: RGB, b: RGB, t: number): RGB {
  return [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t)) as RGB;
}

const DANGER_RGB: RGB = hexToRGB("#e11d62");
/** The world's color journey as the player climbs levels. */
const LEVEL_STOPS = ["#22d3ee", "#7c3aed", "#a855f7", "#ec4899"];
const BEAT_MS = 500; // fallback tempo clock when music is off

interface Mote { x: number; y: number; z: number; tw: number }
interface Burst { x: number; y: number; vx: number; vy: number; life: number; c: string }
interface Reaction { kind: BgPulseKind; born: number; spawned: boolean }

const LEVEL_RGB: RGB[] = LEVEL_STOPS.map(hexToRGB);
function levelColor(level: number): RGB {
  const span = LEVEL_RGB.length - 1;
  const f = Math.max(0, Math.min(span, (level - 1) / 3));
  const i = Math.min(span - 1, Math.floor(f));
  return lerpRGB(LEVEL_RGB[i], LEVEL_RGB[i + 1], f - i);
}

/**
 * Canvas-2D reactive background - the fallback used under reduced motion or when
 * WebGL is unavailable: an ambient mote field, a perspective grid that breathes on
 * the music/tempo clock and shifts color with level, and one-shot reactions to play
 * events (ripples on lock/drop, blooms + outward bursts on clears).
 */
export function CanvasBackground({ danger, level = 1, pulse = null }: BgProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dangerRef = useRef(danger); dangerRef.current = danger;
  const levelRef = useRef(level); levelRef.current = level;

  const energy = useRef(0);
  const reactions = useRef<Reaction[]>([]);
  const motes = useRef<Mote[]>([]);
  const bursts = useRef<Burst[]>([]);
  const lastPulse = useRef(0);

  // React to a new play-event pulse: queue a reaction + bump energy on clears.
  useEffect(() => {
    if (!pulse || pulse.at === lastPulse.current) return;
    lastPulse.current = pulse.at;
    // reduced motion never runs the draw loop, so don't queue (would leak)
    if (!isReducedMotion()) {
      reactions.current.push({ kind: pulse.kind, born: performance.now(), spawned: false });
    }
    if (pulse.kind === "clear") energy.current = Math.min(1, energy.current + 0.3);
    else if (pulse.kind === "overflow" || pulse.kind === "crit") energy.current = Math.min(1, energy.current + 0.55);
    else if (pulse.kind === "fail") energy.current = 1;
  }, [pulse]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = isReducedMotion();
    let raf = 0;
    let last = performance.now();
    let t = 0;

    const ensureMotes = (w: number, h: number) => {
      if (motes.current.length) return;
      for (let i = 0; i < 56; i++) {
        motes.current.push({ x: Math.random() * w, y: Math.random() * h, z: 0.2 + Math.random() * 0.8, tw: Math.random() * Math.PI * 2 });
      }
    };

    const draw = () => {
      const now = performance.now();
      const dt = Math.min(50, now - last); last = now;
      const w = (canvas.width = canvas.clientWidth || 600);
      const h = (canvas.height = canvas.clientHeight || 600);
      const d = dangerRef.current;
      const e = energy.current;
      const mb = getMusic().beat();
      const beat = reduced
        ? 0
        : mb
          ? (Math.sin(mb.phase * Math.PI * 2) + 1) / 2
          : (Math.sin((now % BEAT_MS) / BEAT_MS * Math.PI * 2) + 1) / 2;
      const kickGlow = mb && !reduced ? mb.kick : 0;
      const fx = w / 2, fy = h * 0.45;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#05030d";
      ctx.fillRect(0, 0, w, h);

      const [cr, cg, cb] = lerpRGB(levelColor(levelRef.current), DANGER_RGB, d);
      const grid = `${cr},${cg},${cb}`;

      ensureMotes(w, h);
      for (const m of motes.current) {
        if (!reduced) { m.y += (0.1 + m.z * 0.4) * (1 + e); m.tw += 0.03; if (m.y > h) { m.y = 0; m.x = Math.random() * w; } }
        const a = (0.15 + 0.25 * m.z) * (0.6 + 0.4 * Math.sin(m.tw)) * (0.7 + 0.5 * e);
        ctx.globalAlpha = Math.max(0, Math.min(1, a));
        ctx.fillStyle = `rgb(${grid})`;
        const s = 1 + Math.round(m.z * 1.5);
        ctx.fillRect(m.x, m.y, s, s);
      }
      ctx.globalAlpha = 1;

      const drift = reduced ? 0 : (t * (0.3 + d * 1.2)) % 1;
      ctx.strokeStyle = `rgb(${grid})`;
      ctx.globalAlpha = 0.28 + d * 0.22 + beat * 0.06 + e * 0.12 + kickGlow * 0.1;
      ctx.lineWidth = 1;
      for (let i = 0; i < 16; i++) {
        const f = (i + drift) / 16;
        const y = fy + (h - fy) * f * f;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      for (let i = -8; i <= 8; i++) {
        const x = fx + (i / 8) * w * 0.9;
        ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(fx, fy); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      if (!reduced) {
        reactions.current = reactions.current.filter((rx) => {
          const age = now - rx.born;
          const isBloom = rx.kind === "clear" || rx.kind === "overflow" || rx.kind === "crit" || rx.kind === "fail";
          const life = rx.kind === "fail" ? 800 : isBloom ? 520 : 460;
          if (age > life) return false;
          const p = age / life;
          if (isBloom) {
            const big = rx.kind !== "clear";
            const rad = (rx.kind === "fail" ? 1.3 : big ? 0.9 : 0.55) * Math.max(w, h) * p;
            const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, rad);
            const tint = rx.kind === "fail" ? "245,247,255" : rx.kind === "crit" ? "245,158,11" : grid;
            g.addColorStop(0, `rgba(${tint},${0.35 * (1 - p)})`);
            g.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
            if (!rx.spawned) {
              rx.spawned = true;
              const fail = rx.kind === "fail";
              const n = fail ? 64 : big ? 36 : 20;
              for (let i = 0; i < n; i++) {
                const ang = (i / n) * Math.PI * 2 + Math.random();
                const sp = (1.5 + Math.random() * 3.5 * (big ? 1.4 : 1)) * (fail ? 1.8 : 1);
                bursts.current.push({ x: fx, y: fy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1, c: fail ? "#f5f7ff" : rx.kind === "crit" ? "#f59e0b" : `rgb(${grid})` });
              }
            }
          } else {
            const rad = (rx.kind === "harddrop" ? 0.5 : 0.34) * Math.max(w, h) * p;
            ctx.strokeStyle = `rgba(${grid},${0.5 * (1 - p)})`;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(fx, fy, rad, 0, Math.PI * 2); ctx.stroke();
          }
          return true;
        });

        bursts.current = bursts.current.filter((b) => {
          b.x += b.vx; b.y += b.vy; b.vx *= 0.98; b.vy *= 0.98; b.life -= 0.018;
          if (b.life <= 0) return false;
          ctx.globalAlpha = Math.max(0, b.life);
          ctx.fillStyle = b.c;
          ctx.fillRect(b.x, b.y, 2, 2);
          return true;
        });
        ctx.globalAlpha = 1;
      }

      const vg = ctx.createRadialGradient(w / 2, h / 2, h * (0.5 - d * 0.25), w / 2, h / 2, h * 0.85);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, `rgba(0,0,0,${0.5 + d * 0.35})`);
      ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);

      energy.current = Math.max(0, energy.current - dt * 0.0004);

      if (!reduced) { t += 0.004; raf = requestAnimationFrame(draw); }
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full" />;
}
