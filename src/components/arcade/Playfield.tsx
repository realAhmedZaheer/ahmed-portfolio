"use client";
import { useEffect, useRef } from "react";
import type { GameState } from "@/lib/defrag/types";
import { COLS, VISIBLE_ROWS, BUFFER } from "@/lib/defrag/types";
import { PIECES, PIECE_COLORS } from "@/lib/defrag/pieces";
import { ghostY } from "@/lib/defrag/engine";
import { isReducedMotion } from "@/lib/motionPref";

const CELL = 34;
const W = COLS * CELL;
const H = VISIBLE_ROWS * CELL;

interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; }
interface Ring { x: number; y: number; born: number; color: string; }
interface Ghost { cells: [number, number][]; color: string; a: number; }

/** Dim a hex color toward black by f (0..1). */
function shade(hex: string, f: number): string {
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * f);
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * f);
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * f);
  return `rgb(${r},${g},${b})`;
}

/**
 * Canvas playfield: locked cells, the active + ghost piece, and the cinematic
 * layer - dissolve particles on a clear, a 1-frame white flash + puff on lock,
 * chromatic-aberration split + heavy shake + "STACK OVERFLOW" on a 4-line clear.
 * Reduced motion drops shake/aberration/particles. (creative-direction §4)
 */
export function Playfield({ state }: { state: GameState }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const particles = useRef<Particle[]>([]);
  const shake = useRef({ mag: 0, until: 0 });
  const aberr = useRef(0);
  const overflowText = useRef(0);
  const anomalyAt = useRef(0); // crit ANOMALY ×2 text + amber tear window (perf.now + life)
  const rings = useRef<Ring[]>([]);          // lock shockwaves
  const trail = useRef<Ghost[]>([]);         // active-piece motion afterimages
  const lastKey = useRef("");                // active piece pose, to trail only on move
  const activeCenter = useRef({ x: W / 2, y: H / 2 });
  const shattered = useRef(false);           // SYSTEM FAILURE: the stack has broken apart

  // On top-out, shatter every locked cell into falling debris.
  useEffect(() => {
    if (state.phase === "playing") { shattered.current = false; return; } // reset on a new run
    if (state.phase !== "over" || shattered.current || isReducedMotion()) return;
    shattered.current = true;
    const board = state.board;
    for (let r = 0; r < board.length; r++) {
      const vr = r - BUFFER;
      if (vr < 0) continue;
      for (let c = 0; c < COLS; c++) {
        const cell = board[r][c];
        if (!cell) continue;
        for (let k = 0; k < 4; k++) {
          particles.current.push({
            x: c * CELL + CELL / 2,
            y: vr * CELL + CELL / 2,
            vx: (Math.random() - 0.5) * 5,
            vy: -2 - Math.random() * 3, // kicked up, then gravity pulls them down
            life: 1,
            color: cell,
          });
        }
      }
    }
    shake.current = { mag: 6, until: performance.now() + 450 };
  }, [state.phase, state.board]);

  // React to one-shot events / clears to spawn FX.
  useEffect(() => {
    if (isReducedMotion()) return;
    const now = performance.now();
    const ev = state.event;
    const crit = !!state.lastClear?.crit;
    if (state.lastClear) {
      // lush dissolve - particles fly outward toward the board edges (the payoff
      // that hands off to the reactive background)
      for (const r of state.lastClear.rows) {
        const vr = r - BUFFER;
        if (vr < 0) continue;
        for (let c = 0; c < COLS; c++) {
          const dir = c < COLS / 2 ? -1 : 1;
          for (let k = 0; k < 5; k++) {
            particles.current.push({
              x: c * CELL + CELL / 2,
              y: vr * CELL + CELL / 2,
              vx: dir * (0.6 + Math.random() * 3),
              vy: (Math.random() - 0.5) * 3,
              life: 1,
              color: crit ? "#f59e0b" : "#f5f3ff", // ANOMALY → amber
            });
          }
        }
      }
    }
    // lock shockwave - a ring from where the piece came to rest
    if (!crit && (ev === "lock" || ev === "overflow")) {
      rings.current.push({ x: activeCenter.current.x, y: activeCenter.current.y, born: now, color: ev === "overflow" ? "#fde047" : "#22d3ee" });
    }
    if (crit) {
      // amber horizontal glitch-tear + the ANOMALY ×2 callout
      aberr.current = now + 120;
      anomalyAt.current = now + 600;
      shake.current = { mag: 3, until: now + 120 };
    } else if (ev === "overflow") {
      shake.current = { mag: 5, until: now + 250 };
      aberr.current = now + 200;
      overflowText.current = now + 700;
    } else if (ev === "lock" || ev === "bossattack") {
      shake.current = { mag: 3, until: now + 100 };
    }
  }, [state.event, state.lastClear]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = W;
    canvas.height = H;
    const reduced = isReducedMotion();
    let raf = 0;

    const drawCell = (c: number, r: number, color: string, mode: "locked" | "active" | "ghost") => {
      const vr = r - BUFFER;
      if (vr < 0) return;
      const x = c * CELL;
      const y = vr * CELL;
      if (mode === "ghost") {
        ctx.globalAlpha = 0.25;
        ctx.strokeStyle = color;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(x + 1.5, y + 1.5, CELL - 3, CELL - 3);
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        return;
      }
      if (mode === "active" && !reduced) { ctx.shadowColor = color; ctx.shadowBlur = 12; }
      ctx.fillStyle = mode === "locked" ? shade(color, 0.7) : color;
      ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
      ctx.shadowBlur = 0;
      // top bevel highlight
      ctx.fillStyle = mode === "active" ? "rgba(255,255,255,.5)" : "rgba(255,255,255,.18)";
      ctx.fillRect(x + 1, y + 1, CELL - 2, 2);
    };

    const draw = () => {
      const s = stateRef.current;
      const now = performance.now();
      ctx.clearRect(0, 0, W, H);

      // shake offset
      let ox = 0, oy = 0;
      if (!reduced && now < shake.current.until) {
        const m = shake.current.mag;
        ox = (Math.random() - 0.5) * 2 * m;
        oy = (Math.random() - 0.5) * 2 * m;
      }
      ctx.save();
      ctx.translate(ox, oy);

      // board backdrop
      ctx.fillStyle = "rgba(8,5,16,.78)";
      ctx.fillRect(0, 0, W, H);
      // faint grid
      ctx.strokeStyle = "rgba(124,108,180,.08)";
      for (let c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, H); ctx.stroke(); }
      for (let r = 0; r <= VISIBLE_ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(W, r * CELL); ctx.stroke(); }

      // locked cells (hidden once the stack has shattered into debris)
      if (!shattered.current)
        for (let r = 0; r < s.board.length; r++)
          for (let c = 0; c < COLS; c++) {
            const cell = s.board[r][c];
            if (cell) drawCell(c, r, cell, "locked");
          }

      // motion-trail afterimages (drawn under the live piece)
      if (!reduced) {
        for (const g of trail.current) {
          ctx.globalAlpha = g.a;
          ctx.fillStyle = g.color;
          for (const [c, r] of g.cells) {
            const vr = r - BUFFER;
            if (vr >= 0) ctx.fillRect(c * CELL + 2, vr * CELL + 2, CELL - 4, CELL - 4);
          }
        }
        ctx.globalAlpha = 1;
      }

      // ghost + active
      if (s.active) {
        const color = PIECE_COLORS[s.active.kind];
        const cells = PIECES[s.active.kind][s.active.rot].map(([dx, dy]) => [s.active!.x + dx, s.active!.y + dy] as [number, number]);
        const gy = ghostY(s);
        if (gy !== null) {
          for (const [dx, dy] of PIECES[s.active.kind][s.active.rot])
            drawCell(s.active.x + dx, gy + dy, color, "ghost");
        }
        for (const [c, r] of cells) drawCell(c, r, color, "active");

        // track center (for lock shockwave origin) + push a fading trail snapshot
        const vis = cells.filter(([, r]) => r - BUFFER >= 0);
        if (vis.length) {
          const cx = vis.reduce((s2, [c]) => s2 + c, 0) / vis.length;
          const cy = vis.reduce((s2, [, r]) => s2 + (r - BUFFER), 0) / vis.length;
          activeCenter.current = { x: cx * CELL + CELL / 2, y: cy * CELL + CELL / 2 };
        }
        const key = `${s.active.kind}:${s.active.x}:${s.active.y}:${s.active.rot}`;
        if (!reduced && key !== lastKey.current) {
          lastKey.current = key;
          trail.current.unshift({ cells, color, a: 0.32 });
          trail.current = trail.current.slice(0, 4);
        }
      }
      if (!reduced) {
        for (const g of trail.current) g.a -= 0.06;
        trail.current = trail.current.filter((g) => g.a > 0);
      }

      // particles
      if (!reduced) {
        const next: Particle[] = [];
        for (const p of particles.current) {
          p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= 0.04;
          if (p.life > 0) {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, 3, 3);
            next.push(p);
          }
        }
        ctx.globalAlpha = 1;
        particles.current = next;
      }

      // lock shockwave rings
      if (!reduced) {
        rings.current = rings.current.filter((rg) => {
          const age = now - rg.born;
          const life = 380;
          if (age > life) return false;
          const p = age / life;
          ctx.globalAlpha = 0.6 * (1 - p);
          ctx.strokeStyle = rg.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(rg.x, rg.y, p * CELL * 4, 0, Math.PI * 2);
          ctx.stroke();
          return true;
        });
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      // chromatic aberration split
      if (!reduced && now < aberr.current) {
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = 0.5;
        try {
          const img = ctx.getImageData(0, 0, W, H);
          ctx.putImageData(img, 3, 0);
          ctx.putImageData(img, -3, 0);
        } catch { /* getImageData may be unavailable */ }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }

      // STACK OVERFLOW banner
      if (!reduced && now < overflowText.current) {
        ctx.fillStyle = "#fde047";
        ctx.font = "bold 22px monospace";
        ctx.textAlign = "center";
        ctx.fillText("STACK OVERFLOW", W / 2, H / 2);
        ctx.textAlign = "start";
      }

      // ANOMALY ×2 callout - amber, drifts up + fades over its 600ms window
      if (!reduced && now < anomalyAt.current) {
        const remain = (anomalyAt.current - now) / 600; // 1 → 0
        ctx.globalAlpha = Math.max(0, Math.min(1, remain));
        ctx.fillStyle = "#f59e0b";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText("> ANOMALY ×2", W / 2, H / 2 - (1 - remain) * 20);
        ctx.textAlign = "start";
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="h-full w-full"
      style={{ imageRendering: "pixelated", aspectRatio: `${COLS} / ${VISIBLE_ROWS}` }}
    />
  );
}
