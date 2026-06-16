"use client";
import type { GameState, PieceKind } from "@/lib/defrag/types";
import { PIECES, PIECE_COLORS } from "@/lib/defrag/pieces";
import { POWERUPS, canAfford } from "@/lib/defrag/powerups";

/** Mechanical odometer: each digit is a 0-9 reel that rolls to its value, with
    a right-to-left stagger so the score "counts up" like a gas-pump counter. */
function Odometer({ value, length = 6 }: { value: number; length?: number }) {
  const s = String(Math.max(0, Math.floor(value))).padStart(length, "0");
  return (
    <span aria-hidden className="inline-flex items-center align-middle">
      {s.split("").map((d, i) => (
        <span key={i} className="relative inline-block h-[1em] w-[0.62em] overflow-hidden">
          <span
            className="odo-reel block"
            style={{ transform: `translateY(-${Number(d) * 10}%)`, transitionDelay: `${(s.length - 1 - i) * 50}ms` }}
          >
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n} className="block h-[1em] leading-[1em]">{n}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}

/** Tiny pixel preview of a piece in its spawn rotation. */
function PiecePreview({ kind, size = 5 }: { kind: PieceKind; size?: number }) {
  const cells = PIECES[kind][0];
  const maxX = Math.max(...cells.map(([x]) => x));
  const minX = Math.min(...cells.map(([x]) => x));
  const maxY = Math.max(...cells.map(([, y]) => y));
  const minY = Math.min(...cells.map(([, y]) => y));
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  return (
    <svg width={w * size} height={h * size} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" aria-hidden>
      {cells.map(([x, y], i) => (
        <rect key={i} x={x - minX} y={y - minY} width={1} height={1} fill={PIECE_COLORS[kind]} />
      ))}
    </svg>
  );
}

/** Terminal-style readout from inside the system. (creative-direction §6) */
export function GameHud({ state, bombReady = false }: { state: GameState; bombReady?: boolean }) {
  const pct = Math.round((state.boss.hp / state.boss.maxHp) * 100);
  const segs = Math.round(state.charge / 10);
  return (
    <div className="font-pixel flex flex-col gap-4 text-[8px] text-cyan">
      <div className="space-y-1.5">
        <p className="flex items-center gap-1">
          <span className="text-dim">THR:</span>{" "}
          <span className="text-yellow"><Odometer value={state.score} /></span>
        </p>
        <p>
          <span className="text-dim">SEC:</span> <span className="text-white">{state.level}</span>
        </p>
        <p>
          <span className="text-dim">DEF:</span> <span className="text-white">{state.lines}</span>
        </p>
      </div>

      {/* charge meter */}
      <div>
        <p className={segs >= 10 ? "blink text-pink" : "text-dim"}>PWR: {state.charge}</p>
        <div className="mt-1 flex gap-0.5">
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              className={i < segs && bombReady ? "h-2 w-2 pwr-cascade" : "h-2 w-2"}
              style={{ background: i < segs ? "var(--pink)" : "rgba(148,136,189,.2)", animationDelay: `${i * 30}ms` }}
            />
          ))}
        </div>
        {bombReady && <p className="blink mt-1 text-cyan">&gt; BOMB READY</p>}
      </div>

      {/* powerups */}
      <div className="space-y-1">
        {POWERUPS.map((p) => {
          const ok = canAfford(state.charge, p.id);
          return (
            <div key={p.id} className={ok ? "text-cyan" : "text-dim/60"}>
              [{p.key}] {p.label} <span className="text-dim">·{p.cost}</span>
            </div>
          );
        })}
      </div>

      {/* queue */}
      <div>
        <p className="text-dim">QUEUE:</p>
        <div className="mt-1 flex flex-col gap-1.5">
          {state.queue.slice(0, 5).map((k, i) => (
            <div key={i} className={i === 0 ? "scale-110 opacity-100" : "opacity-60"}>
              <PiecePreview kind={k} size={i === 0 ? 6 : 5} />
            </div>
          ))}
        </div>
      </div>

      {/* hold - up to two slots; front (next to swap) on top, back dimmer */}
      <div>
        <p className="text-dim">HOLD:</p>
        <div className="mt-1 flex flex-col gap-1">
          {state.holds.length === 0 && <span className="text-dim/50">[EMPTY]</span>}
          {state.holds.map((k, i) => (
            <div
              key={`${k}-${i}`}
              className={i === 0 ? "hold-pop origin-left" : "origin-left"}
              style={i === 0 ? undefined : { transform: "scale(0.6)", opacity: 0.5 }}
            >
              <PiecePreview kind={k} size={6} />
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        SECTOR {state.level} · THROUGHPUT {state.score} · FIREWALL {pct}%
      </span>
    </div>
  );
}
