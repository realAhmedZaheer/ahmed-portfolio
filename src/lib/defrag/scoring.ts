const LINE_SCORES = [0, 100, 300, 500, 800];

export function scoreForClear(lines: number, level: number): number {
  return (LINE_SCORES[lines] ?? 0) * level;
}

export function levelForLines(lines: number): number {
  return Math.floor(lines / 10) + 1;
}

/** Base 800ms, ×0.85 per level, floored at 60ms; gravityScale (meta upgrade) multiplies up. */
export function dropIntervalMs(level: number, gravityScale = 1): number {
  const base = 800 * Math.pow(0.85, level - 1);
  return Math.max(60, base) * gravityScale;
}
