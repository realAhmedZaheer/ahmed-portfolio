"use client";

/**
 * Chunky pixel-art trophy. A dark offset "back" layer behind the gold gives a
 * faux-3D / isometric read; a shine sweeps across and the cup wobbles. Motion
 * is disabled under reduced-motion via the .trophy-anim / .trophy-shine rules.
 */
export function TrophyPixel({ size = 64 }: { size?: number }) {
  // 11x11 grid: '.' empty, 'G' gold, 'D' dark gold, 'S' stem/base
  const ART = [
    "...........",
    ".G.GGGGG.G.",
    ".GGGGGGGGG.",
    ".GGGGGGGGG.",
    ".GGGGGGGGG.",
    "..GGGGGGG..",
    "...GGGGG...",
    ".....S.....",
    "....SSS....",
    "...SSSSS...",
    "..SSSSSSS..",
  ];
  const COLORS: Record<string, string> = {
    G: "#fde047",
    D: "#b8860b",
    S: "#a16207",
  };
  const cells: { x: number; y: number; c: string }[] = [];
  ART.forEach((row, y) =>
    row.split("").forEach((ch, x) => {
      if (ch !== ".") cells.push({ x, y, c: COLORS[ch] });
    }),
  );

  return (
    <span
      aria-hidden
      className="relative inline-block trophy-anim"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 11 11"
        shapeRendering="crispEdges"
        className="block"
      >
        {/* dark offset back-layer for depth */}
        {cells.map((p, i) => (
          <rect key={`b${i}`} x={p.x + 0.35} y={p.y + 0.35} width={1} height={1} fill="#5b3d00" />
        ))}
        {/* gold front face */}
        {cells.map((p, i) => (
          <rect key={`f${i}`} x={p.x} y={p.y} width={1} height={1} fill={p.c} />
        ))}
      </svg>
      <span className="trophy-shine" />
    </span>
  );
}
