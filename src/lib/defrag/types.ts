export type PieceKind = "I" | "O" | "T" | "S" | "Z" | "J" | "L";
export type Rot = 0 | 1 | 2 | 3;

/** A board cell: null = empty, otherwise a hex color string. Garbage uses GARBAGE_COLOR. */
export type Cell = string | null;
/** board[row][col]; row 0 is the TOP. Includes BUFFER hidden rows above the visible 20. */
export type Board = Cell[][];

export interface Piece {
  kind: PieceKind;
  rot: Rot;
  x: number; // column of the piece origin
  y: number; // row of the piece origin (may be within the hidden buffer, i.e. < BUFFER)
}

export type PowerupId = "bomb" | "laser" | "slow";

export type GamePhase = "ready" | "playing" | "paused" | "over" | "won";

/** Transient one-shot tags the renderer/audio read each dispatch, then ignore. */
export type GameEventTag =
  | "spawn" | "move" | "rotate" | "hold" | "lock" | "harddrop"
  | "powerup" | "bosshit" | "bossattack" | "overflow" | "levelup";

export interface ClearEvent {
  rows: number[];
  lines: number;
  isOverflow: boolean;
  crit?: boolean;
}

export interface BossState {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attackEveryMs: number;
}

export interface RunConfig {
  queueSize: number;
  startCharge: number;
  gravityScale: number; // 1 = normal; >1 slows base gravity (meta upgrade)
  holdSlots: number;    // 1 (hold-two → 2)
  garbageGaps: number;  // 1 (garbage-res → 2)
  chargePerLine: number; // 20 (charge-rate → 25/30)
  critChance: number;   // 0 (crit-clear → 0.10)
}

export interface GameState {
  board: Board;
  active: Piece | null;
  holds: PieceKind[]; // 0..config.holdSlots, front = next to swap in
  canHold: boolean;
  queue: PieceKind[];
  bag: PieceKind[];
  seed: number;
  score: number;
  lines: number;
  level: number;
  charge: number;     // 0..100
  slowTicks: number;  // >0 halves gravity (component reads)
  grounded: boolean;  // active piece is resting; component runs lock-delay
  lockX: number;      // 0..1 horizontal centre of the last locked piece (for FX origin)
  phase: GamePhase;
  boss: BossState;
  config: RunConfig;
  lastClear: ClearEvent | null;
  event: GameEventTag | null;
}

export type Action =
  | { type: "START"; seed: number; config?: Partial<RunConfig> }
  | { type: "MOVE"; dir: -1 | 1 }
  | { type: "ROTATE"; dir: 1 | -1 }
  | { type: "SOFT_DROP" }
  | { type: "HARD_DROP" }
  | { type: "TICK" }
  | { type: "LOCK" }
  | { type: "HOLD" }
  | { type: "USE_POWERUP"; id: PowerupId }
  | { type: "BOSS_ATTACK" }
  | { type: "PAUSE" }
  | { type: "RESUME" };

export const COLS = 10;
export const VISIBLE_ROWS = 20;
export const BUFFER = 2;
export const ROWS = VISIBLE_ROWS + BUFFER; // 22
export const GARBAGE_COLOR = "#3b3357";
export const DEFAULT_CONFIG: RunConfig = {
  queueSize: 5,
  startCharge: 0,
  gravityScale: 1,
  holdSlots: 1,
  garbageGaps: 1,
  chargePerLine: 20,
  critChance: 0,
};
