/** Classic two-frame "crab" invader, authored as pixel rows. */
const FRAME_A = [
  "..X.....X..",
  "...X...X...",
  "..XXXXXXX..",
  ".XX.XXX.XX.",
  "XXXXXXXXXXX",
  "X.XXXXXXX.X",
  "X.X.....X.X",
  "...XX.XX...",
];
const FRAME_B = [
  "..X.....X..",
  "X..X...X..X",
  "X.XXXXXXX.X",
  "XXX.XXX.XXX",
  ".XXXXXXXXX.",
  "..XXXXXXX..",
  "..X.....X..",
  ".X.......X.",
];

function Frame({ rows }: { rows: string[] }) {
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

interface InvaderSpriteProps {
  className?: string;
  fill: string;
}

/** Animated (frame-swapping) pixel invader. Walk cycle pauses under reduced motion. */
export function InvaderSprite({ className, fill }: InvaderSpriteProps) {
  return (
    <svg viewBox="0 0 11 8" className={className} style={{ shapeRendering: "crispEdges", fill }}>
      <g className="sprite-frame-a">
        <Frame rows={FRAME_A} />
      </g>
      <g className="sprite-frame-b">
        <Frame rows={FRAME_B} />
      </g>
    </svg>
  );
}
