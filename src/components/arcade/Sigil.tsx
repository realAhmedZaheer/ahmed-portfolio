"use client";

/** GATEKEEPER.SYS sigil: a deconstructed padlock. Degrades in place with HP -
    color shifts, crack lines appear, and on defeat every pixel scatters.
    (creative-direction - sigil spec) */

const GRID = [
  ".....###.....",
  "....#...#....",
  "...#.....#...",
  "...#.....#...",
  "...#.....#...",
  ".###########.",
  ".#.........#.",
  ".#.##.##.#.#.",
  ".#.........#.",
  ".#...###...#.",
  ".#...#.#...#.",
  ".#...###...#.",
  ".###########.",
];
const N = 13;

/** Cells removed at each cumulative crack level (the "gap"). */
const CRACK_GAPS: Record<number, [number, number][]> = {
  1: [[9, 2]],            // diagonal gap through the shackle, offset right
  2: [[1, 8], [11, 8]],   // horizontal fracture breaks the body walls
  3: [[7, 10]],           // keyhole distorts: #.# becomes #..
};
/** White fracture pixels drawn across each gap. */
const CRACK_WHITES: Record<number, [number, number][]> = {
  1: [[8, 1], [9, 3]],
  2: [[3, 8], [5, 8], [7, 8], [9, 8]],
  3: [[6, 9], [8, 9]],
};

function tierFor(frac: number): { color: string; cracks: number; pulse: number } {
  if (frac <= 0) return { color: "#ef4444", cracks: 3, pulse: 0 };
  if (frac <= 0.25) return { color: "#ef4444", cracks: 3, pulse: 0.6 };
  if (frac <= 0.5) return { color: "#ec4899", cracks: 2, pulse: 1.0 };
  if (frac <= 0.75) return { color: "#a855f7", cracks: 1, pulse: 1.4 };
  return { color: "#22d3ee", cracks: 0, pulse: 2.0 };
}

const FILLED: [number, number][] = GRID.flatMap((row, y) =>
  row.split("").flatMap((ch, x) => (ch === "#" ? [[x, y] as [number, number]] : [])),
);

export function Sigil({ hpFraction, size = 52 }: { hpFraction: number; size?: number }) {
  const shattered = hpFraction <= 0;
  const { color, cracks, pulse } = tierFor(hpFraction);

  // Defeat: every filled pixel flies outward from the center.
  if (shattered) {
    const px = size / N;
    return (
      <span aria-hidden className="relative inline-block" style={{ width: size, height: size }}>
        {FILLED.map(([x, y], i) => {
          const dirx = (x - 6) / 6;
          const diry = (y - 6) / 6;
          const spread = 0.7 + ((i * 37) % 10) / 20; // deterministic jitter
          return (
            <span
              key={i}
              className="sigil-shard absolute"
              style={{
                left: x * px,
                top: y * px,
                width: px,
                height: px,
                background: i % 4 === 0 ? "#f5f3ff" : "#ef4444",
                ["--tx" as string]: `${dirx * size * spread}px`,
                ["--ty" as string]: `${diry * size * spread}px`,
              }}
            />
          );
        })}
      </span>
    );
  }

  const gaps = new Set<string>();
  const whites = new Set<string>();
  for (let lvl = 1; lvl <= cracks; lvl++) {
    for (const [x, y] of CRACK_GAPS[lvl] ?? []) gaps.add(`${x},${y}`);
    for (const [x, y] of CRACK_WHITES[lvl] ?? []) whites.add(`${x},${y}`);
  }

  const rects: { x: number; y: number; fill: string }[] = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const key = `${x},${y}`;
      if (whites.has(key)) {
        rects.push({ x, y, fill: "#f5f3ff" });
      } else if (GRID[y][x] === "#" && !gaps.has(key)) {
        rects.push({ x, y, fill: color });
      }
    }
  }

  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox={`0 0 ${N} ${N}`}
      shapeRendering="crispEdges"
      className="sigil-pulse"
      style={{ animationDuration: pulse ? `${pulse}s` : undefined }}
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={1} height={1} fill={r.fill} />
      ))}
    </svg>
  );
}
