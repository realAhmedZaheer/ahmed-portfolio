"use client";

/**
 * Tiny 8×8 pixel-art glyphs rendered as inline `<rect>`s (crispEdges), used as
 * 48×48 "level select" thumbnails on project cards. Each glyph is authored as
 * rows of "X"/"." like the invader sprite. Color is passed via `fill`.
 */

type Glyph = string[];

const GLYPHS: Record<string, Glyph> = {
  // wrench - config / reliability tooling
  wrench: [
    "...XXX..",
    "..XX.X..",
    "..XXXX..",
    "...XX...",
    "..XX....",
    ".XX.....",
    "XX......",
    "X.......",
  ],
  // padlock - security / fraud
  lock: [
    "..XXXX..",
    ".XX..XX.",
    ".XX..XX.",
    "XXXXXXXX",
    "XXX..XXX",
    "XXX..XXX",
    "XXXXXXXX",
    "XXXXXXXX",
  ],
  // bar chart - metrics / scoring
  chart: [
    "........",
    "......XX",
    "...XX.XX",
    "...XX.XX",
    ".XXXX.XX",
    ".XXXX.XX",
    ".XXXXXXX",
    "XXXXXXXX",
  ],
  // database / stack of disks - data pipelines, mongo
  database: [
    ".XXXXXX.",
    "XXXXXXXX",
    "X......X",
    "XXXXXXXX",
    "X......X",
    "XXXXXXXX",
    "XXXXXXXX",
    ".XXXXXX.",
  ],
  // branching arrows - migrations / cross-platform
  branch: [
    "XX....XX",
    "XX....XX",
    "XX..XXXX",
    "XX.XX...",
    "XXXX....",
    "XX.XX...",
    "XX..XXXX",
    "XX....XX",
  ],
  // cards / flip - flashcards, dashboards
  cards: [
    "..XXXXXX",
    ".XXXXXX.",
    "XXXXXX.X",
    "XXXXX.XX",
    "XXXXX.XX",
    "XXXXX.XX",
    ".XXXXXX.",
    "..XXXX..",
  ],
  // lightning - cache / ISR / speed
  bolt: [
    "....XXX.",
    "...XXX..",
    "..XXX...",
    ".XXXXXX.",
    "...XXX..",
    "..XXX...",
    ".XXX....",
    "XXX.....",
  ],
  // node graph - orchestration / diffusion node-graph
  nodes: [
    "XX....XX",
    "XX....XX",
    ".XX..XX.",
    "..XXXX..",
    "...XX...",
    "..XXXX..",
    ".XX..XX.",
    "XX....XX",
  ],
  // box / container - docker / containerized infra
  box: [
    "XXXXXXXX",
    "X.X..X.X",
    "X.X..X.X",
    "XXXXXXXX",
    "X.X..X.X",
    "X.X..X.X",
    "X.X..X.X",
    "XXXXXXXX",
  ],
  // upload arrow - uploads pipeline
  upload: [
    "...XX...",
    "..XXXX..",
    ".XXXXXX.",
    "XX.XX.XX",
    "...XX...",
    "...XX...",
    "XXXXXXXX",
    "XXXXXXXX",
  ],
};

/** Map each project card id to a glyph; falls back to a generic chart. */
const CARD_GLYPH: Record<string, keyof typeof GLYPHS> = {
  roadmapper: "branch",
  facet: "database",
  migrations: "branch",
  flashcards: "cards",
  isr: "bolt",
  "chat-reliability": "wrench",
  "edit-dashboard": "nodes",
  "worker-orch": "nodes",
  containers: "box",
  "upload-pipeline": "upload",
};

interface PixelIconProps {
  /** Project card id used to pick the glyph. */
  glyphId: string;
  /** CSS color value (e.g. "var(--cyan)") for the pixels. */
  fill: string;
  className?: string;
}

/** 48×48 pixel-art icon for a project card, chosen from `glyphId`. */
export function PixelIcon({ glyphId, fill, className }: PixelIconProps) {
  const rows = GLYPHS[CARD_GLYPH[glyphId] ?? "chart"];
  return (
    <svg
      viewBox="0 0 8 8"
      width={48}
      height={48}
      className={className}
      style={{ shapeRendering: "crispEdges", fill, color: fill }}
      aria-hidden
    >
      {rows.flatMap((row, y) =>
        row
          .split("")
          .map((ch, x) =>
            ch === "X" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} /> : null,
          ),
      )}
    </svg>
  );
}
