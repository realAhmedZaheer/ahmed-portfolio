import type { Board, Piece } from "./types";
import { ROWS, COLS, GARBAGE_COLOR } from "./types";
import { PIECES, PIECE_COLORS } from "./pieces";
import { nextRandom } from "./rng";

export function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<string | null>(COLS).fill(null));
}

/** Absolute [col,row] cells the piece occupies. */
export function pieceCells(p: Piece): [number, number][] {
  return PIECES[p.kind][p.rot].map(([dx, dy]) => [p.x + dx, p.y + dy]);
}

export function collides(board: Board, p: Piece): boolean {
  for (const [c, r] of pieceCells(p)) {
    if (c < 0 || c >= COLS || r >= ROWS) return true;
    if (r >= 0 && board[r][c] !== null) return true;
  }
  return false;
}

export function merge(board: Board, p: Piece): Board {
  const next = board.map((row) => [...row]);
  for (const [c, r] of pieceCells(p)) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) next[r][c] = PIECE_COLORS[p.kind];
  }
  return next;
}

export function fullRows(board: Board): number[] {
  const rows: number[] = [];
  for (let r = 0; r < ROWS; r++) if (board[r].every((c) => c !== null)) rows.push(r);
  return rows;
}

/** Remove the given rows and drop everything above down; refill the top with empties. */
export function clearRows(board: Board, rows: number[]): Board {
  const drop = new Set(rows);
  const kept = board.filter((_, r) => !drop.has(r));
  const fresh = Array.from({ length: rows.length }, () => Array<string | null>(COLS).fill(null));
  return [...fresh, ...kept];
}

/** Add n garbage rows at the bottom (random gaps), pushing the stack up; toppedOut if filled rows were pushed off the top. */
export function injectGarbage(
  board: Board,
  n: number,
  seed = 1,
  gaps = 1,
): { board: Board; seed: number; toppedOut: boolean } {
  let s = seed;
  const rows: Board = [];
  const want = Math.min(gaps, COLS - 1);
  for (let i = 0; i < n; i++) {
    const gapCols = new Set<number>();
    while (gapCols.size < want) {
      const r = nextRandom(s); s = r.seed;
      gapCols.add(Math.floor(r.value * COLS));
    }
    rows.push(Array.from({ length: COLS }, (_, c) => (gapCols.has(c) ? null : GARBAGE_COLOR)));
  }
  const toppedOut = board.slice(0, n).some((row) => row.some((c) => c !== null));
  return { board: [...board.slice(n), ...rows], seed: s, toppedOut };
}

/** Lowest origin-y at which the piece still fits (hard-drop target). */
export function ghostDrop(board: Board, p: Piece): number {
  let y = p.y;
  while (!collides(board, { ...p, y: y + 1 })) y++;
  return y;
}
