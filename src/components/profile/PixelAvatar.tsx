import { cn } from "@/lib/cn";

const HOOD = "#7c3aed";
const SHADE = "#4c1d95";
const VOID = "#140b26";
const VISOR = "#22d3ee";
const GLINT = "#eafff3";
const MOUTH = "#ec4899";
const TORSO = "#2a1d4a";
const BADGE = "#fde047";

/** [x, y, width, color] runs on a 16×16 grid. */
const RUNS: [number, number, number, string][] = [
  [6, 1, 4, HOOD],
  [5, 2, 6, HOOD],
  [4, 3, 8, HOOD],
  [4, 4, 1, HOOD], [5, 4, 6, SHADE], [11, 4, 1, HOOD],
  [3, 5, 2, HOOD], [5, 5, 6, VOID], [11, 5, 2, HOOD],
  [3, 6, 2, HOOD], [5, 6, 6, VISOR], [6, 6, 1, GLINT], [11, 6, 2, HOOD],
  [3, 7, 2, HOOD], [5, 7, 6, VOID], [11, 7, 2, HOOD],
  [3, 8, 2, HOOD], [5, 8, 2, VOID], [7, 8, 2, MOUTH], [9, 8, 2, VOID], [11, 8, 2, HOOD],
  [4, 9, 8, SHADE],
  [3, 10, 10, TORSO],
  [2, 11, 12, TORSO], [7, 11, 2, BADGE],
  [2, 12, 12, TORSO],
  [2, 13, 12, SHADE],
];

/** Animated floating sparks around the avatar. */
const SPARKS: [number, number, string, string][] = [
  [14, 4, VISOR, "0s"],
  [1, 9, MOUTH, "0.9s"],
  [14, 12, BADGE, "1.6s"],
  [0, 3, VISOR, "2.2s"],
];

interface PixelAvatarProps {
  className?: string;
}

/** 16x16 pixel-art operator sprite with idle bob, visor scan, and sparks. */
export function PixelAvatar({ className }: PixelAvatarProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      role="img"
      aria-label="Pixel-art avatar of Ahmed"
      className={cn("avatar-bob", className)}
      style={{ shapeRendering: "crispEdges", imageRendering: "pixelated" }}
    >
      {RUNS.map(([x, y, w, c], i) => (
        <rect key={i} x={x} y={y} width={w} height={1} fill={c} />
      ))}

      <rect className="av-scan" x={5} y={6} width={1} height={1} fill={GLINT} />
      <rect className="av-blink" x={5} y={6} width={6} height={1} fill={VOID} />

      {SPARKS.map(([x, y, c, delay], i) => (
        <rect
          key={`s${i}`}
          className="av-spark"
          x={x}
          y={y}
          width={1}
          height={1}
          fill={c}
          style={{ animationDelay: delay }}
        />
      ))}
    </svg>
  );
}
