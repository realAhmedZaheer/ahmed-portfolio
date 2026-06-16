/**
 * Tiny pixel-art glyphs for the SIDE QUEST category cards. Each is authored as
 * ASCII rows mapped to crisp <rect> cells (same convention as TrophyPixel /
 * InvaderSprite). Purely decorative - always rendered aria-hidden, the text
 * label carries the meaning.
 */

// agentic - a pixel brain (two lobes with a fold down the middle)
const BRAIN = [
  "..XXXX..",
  ".XXXXXX.",
  "XXX..XXX",
  "XX.XX.XX",
  "XXX..XXX",
  ".XXXXXX.",
  ".X.XX.X.",
  "..X..X..",
];

// ml-infra - a GPU / accelerator card (board + heatsink fins + fan dot)
const GPU = [
  "XXXXXXXX",
  "X.XXXX.X",
  "X.X..X.X",
  "X.X..X.X",
  "X.XXXX.X",
  "XXXXXXXX",
  "..X..X..",
  "..X..X..",
];

// fullstack - a layered stack (three slabs stacked with depth offsets)
const STACK = [
  "..XXXX..",
  ".XXXXXX.",
  "XXXXXXXX",
  "..XXXX..",
  ".XXXXXX.",
  "XXXXXXXX",
  "..XXXX..",
  ".XXXXXX.",
];

// unsure - a die showing five pips (the "surprise me" roll). Face is filled;
// the 'O' pips punch dark holes so they read as dots on the die.
const DICE = [
  "XXXXXXXX",
  "XXXXXXXX",
  "XXOXXOXX",
  "XXXOXXXX",
  "XXOXXOXX",
  "XXXXXXXX",
  "XXXXXXXX",
  "XXXXXXXX",
];

const ART: Record<string, string[]> = {
  agentic: BRAIN,
  "ml-infra": GPU,
  fullstack: STACK,
  unsure: DICE,
};

/** Cell glyphs → fill. 'X' uses currentColor; 'O' is a dark pip (cut-out look). */
function cellFill(ch: string): string | null {
  if (ch === "X") return "currentColor";
  if (ch === "O") return "var(--color-bg, #0a0a12)";
  return null;
}

interface CategoryIconProps {
  id: string;
  className?: string;
}

/**
 * Renders the pixel glyph for a category id. Inherits color from `currentColor`
 * so it tints with the card's text (cyan on hover). Unknown ids render nothing.
 */
export function CategoryIcon({ id, className }: CategoryIconProps) {
  const rows = ART[id];
  if (!rows) return null;
  return (
    <svg
      aria-hidden
      viewBox="0 0 8 8"
      className={className}
      style={{ shapeRendering: "crispEdges" }}
    >
      {rows.flatMap((row, y) =>
        row.split("").map((ch, x) => {
          const fill = cellFill(ch);
          return fill ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />
          ) : null;
        }),
      )}
    </svg>
  );
}
