/* Decorative, animated life for the title screen. Everything here is
   aria-hidden and pointer-events-none - pure attract-mode atmosphere. */

const STAR_COLORS = [
  "rgba(245,243,255,.9)",
  "rgba(148,136,189,.9)",
  "rgba(34,211,238,.8)",
  "rgba(236,72,153,.7)",
  "rgba(253,224,71,.7)",
];

const STARS = Array.from({ length: 90 }, (_, i) => {
  const hash = (i * 2654435761) >>> 0;
  return {
    left: hash % 100,
    top: (hash >> 7) % 100,
    size: 2 + ((hash >> 3) % 3),
    color: STAR_COLORS[(hash >> 5) % STAR_COLORS.length],
    dur: 2 + ((hash >> 9) % 30) / 10,
    delay: ((hash >> 11) % 40) / 10,
  };
});

const FALLERS = Array.from({ length: 12 }, (_, i) => {
  const hash = ((i + 31) * 2654435761) >>> 0;
  return {
    left: hash % 100,
    size: 2 + (hash % 3),
    color: STAR_COLORS[(hash >> 4) % STAR_COLORS.length],
    dur: 12 + (hash % 14),
    delay: -((hash >> 6) % 16),
  };
});

/** Classic two-frame "crab" invader, authored as pixel rows. */
const INVADER_A = [
  "..X.....X..",
  "...X...X...",
  "..XXXXXXX..",
  ".XX.XXX.XX.",
  "XXXXXXXXXXX",
  "X.XXXXXXX.X",
  "X.X.....X.X",
  "...XX.XX...",
];
const INVADER_B = [
  "..X.....X..",
  "X..X...X..X",
  "X.XXXXXXX.X",
  "XXX.XXX.XXX",
  ".XXXXXXXXX.",
  "..XXXXXXX..",
  "..X.....X..",
  ".X.......X.",
];

function SpriteFrame({ rows }: { rows: string[] }) {
  return (
    <>
      {rows.flatMap((row, y) =>
        row.split("").map((ch, x) =>
          ch === "X" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} /> : null,
        ),
      )}
    </>
  );
}

function Invader({ className, fill }: { className?: string; fill: string }) {
  return (
    <svg
      viewBox="0 0 11 8"
      className={className}
      style={{ shapeRendering: "crispEdges", fill }}
    >
      <g className="sprite-frame-a">
        <SpriteFrame rows={INVADER_A} />
      </g>
      <g className="sprite-frame-b">
        <SpriteFrame rows={INVADER_B} />
      </g>
    </svg>
  );
}

export function TitleBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* twinkling starfield */}
      {STARS.map((s, i) => (
        <span
          key={`s${i}`}
          className="twinkle absolute"
          style={
            {
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              background: s.color,
              "--tw-dur": `${s.dur}s`,
              "--tw-delay": `${s.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* slow pixel rain */}
      {FALLERS.map((f, i) => (
        <span
          key={`f${i}`}
          className="fall absolute"
          style={
            {
              left: `${f.left}%`,
              top: 0,
              width: f.size,
              height: f.size * 3,
              background: f.color,
              opacity: 0.5,
              "--fall-dur": `${f.dur}s`,
              "--fall-delay": `${f.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* patrolling invaders, walking their two frames */}
      <div className="sprite-bob absolute left-[7%] top-[30%]">
        <Invader className="h-auto w-24 opacity-25 sm:w-32" fill="var(--pink)" />
      </div>
      <div className="sprite-bob absolute right-[7%] bottom-[26%] [animation-delay:2.2s]">
        <Invader className="h-auto w-20 opacity-25 sm:w-28" fill="var(--cyan)" />
      </div>
      <div className="sprite-bob absolute right-[16%] top-[16%] [animation-delay:1.1s]">
        <Invader className="h-auto w-12 opacity-20 sm:w-16" fill="var(--purple)" />
      </div>

      {/* halftone corner texture */}
      <div
        className="absolute -left-10 -top-10 h-64 w-64 opacity-30"
        style={{
          backgroundImage: "radial-gradient(rgba(168,85,247,.5) 1.5px, transparent 1.5px)",
          backgroundSize: "12px 12px",
          maskImage: "radial-gradient(circle at 0 0, black 0%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle at 0 0, black 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-10 -right-10 h-64 w-64 opacity-30"
        style={{
          backgroundImage: "radial-gradient(rgba(34,211,238,.5) 1.5px, transparent 1.5px)",
          backgroundSize: "12px 12px",
          maskImage: "radial-gradient(circle at 100% 100%, black 0%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle at 100% 100%, black 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
