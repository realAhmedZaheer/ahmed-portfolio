import type { Board, Piece, PowerupId } from "./types";
import { ROWS, COLS } from "./types";
import { pieceCells, clearRows } from "./board";

export interface PowerupDef {
  id: PowerupId;
  label: string;
  desc: string;
  cost: number;
  key: string; // keyboard shortcut shown in HUD
}

export const POWERUPS: PowerupDef[] = [
  { id: "laser", label: "LINE LASER", desc: "Vaporize the lowest row.", cost: 60, key: "1" },
  { id: "slow", label: "SLOW-TIME", desc: "Halve gravity briefly.", cost: 80, key: "2" },
  { id: "bomb", label: "BOMB", desc: "Detonate a 3×3 block.", cost: 100, key: "3" },
];

export const SLOW_TICKS = 600; // component reads; ~ a few seconds of halved gravity

export function chargeForLines(charge: number, lines: number, perLine = 20): number {
  return Math.min(100, charge + lines * perLine);
}

export function canAfford(charge: number, id: PowerupId): boolean {
  const def = POWERUPS.find((p) => p.id === id);
  return !!def && charge >= def.cost;
}

export function costOf(id: PowerupId): number {
  return POWERUPS.find((p) => p.id === id)?.cost ?? 0;
}

/** Clear a 3×3 region centered on the active piece's average cell. */
export function applyBomb(board: Board, active: Piece): Board {
  const cells = pieceCells(active);
  const cx = Math.round(cells.reduce((s, [c]) => s + c, 0) / cells.length);
  const cy = Math.round(cells.reduce((s, [, r]) => s + r, 0) / cells.length);
  const next = board.map((row) => [...row]);
  for (let r = cy - 1; r <= cy + 1; r++)
    for (let c = cx - 1; c <= cx + 1; c++)
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) next[r][c] = null;
  return next;
}

/** Vaporize the lowest filled row, then collapse the stack down onto the gap. */
export function applyLaser(board: Board): Board {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].some((c) => c !== null)) {
      return clearRows(board, [r]);
    }
  }
  return board;
}
