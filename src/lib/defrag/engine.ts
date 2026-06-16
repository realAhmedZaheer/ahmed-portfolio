import type { GameState, Action, Piece, Rot, ClearEvent } from "./types";
import { DEFAULT_CONFIG, COLS } from "./types";
import { shuffleBag, nextRandom } from "./rng";
import { spawnPiece, KICKS, kickKey } from "./pieces";
import { emptyBoard, collides, merge, fullRows, clearRows, injectGarbage, ghostDrop, pieceCells } from "./board";
import { scoreForClear, levelForLines } from "./scoring";
import { chargeForLines, canAfford, costOf, applyBomb, applyLaser, SLOW_TICKS } from "./powerups";
import { makeGatekeeper, damageBoss } from "./bosses";

export function initialState(): GameState {
  return {
    board: emptyBoard(),
    active: null,
    holds: [],
    canHold: true,
    queue: [],
    bag: [],
    seed: 1,
    score: 0,
    lines: 0,
    level: 1,
    charge: 0,
    slowTicks: 0,
    grounded: false,
    lockX: 0.5,
    phase: "ready",
    boss: makeGatekeeper(),
    config: DEFAULT_CONFIG,
    lastClear: null,
    event: null,
  };
}

/** Ensure queue has >= config.queueSize kinds, refilling the bag as needed. */
function refill(state: GameState): GameState {
  let bag = [...state.bag];
  let seed = state.seed;
  const queue = [...state.queue];
  while (queue.length < state.config.queueSize) {
    if (bag.length === 0) {
      const [nb, ns] = shuffleBag(seed);
      bag = nb;
      seed = ns;
    }
    queue.push(bag.shift()!);
  }
  return { ...state, bag, seed, queue };
}

/** Pop the next kind into a fresh active piece (keeping the queue topped up);
    set phase 'over' if it can't spawn. */
function spawnNext(state: GameState): GameState {
  let s = refill(state);
  const kind = s.queue[0];
  const active = spawnPiece(kind);
  s = refill({ ...s, queue: s.queue.slice(1) });
  if (collides(s.board, active)) {
    return { ...s, active, phase: "over", event: "lock", grounded: false };
  }
  return { ...s, active, grounded: false, canHold: true, event: "spawn" };
}

/** Merge active, clear lines, score, damage boss, charge, then spawn next (or win). */
function lockPiece(state: GameState): GameState {
  if (!state.active) return state;
  const cells = pieceCells(state.active);
  const lockX = cells.reduce((s, [c]) => s + c, 0) / cells.length / COLS;
  let board = merge(state.board, state.active);
  const rows = fullRows(board);
  let { score, lines, level, charge, boss, seed } = state;
  let lastClear: ClearEvent | null = null;

  if (rows.length > 0) {
    // crit-clear: a lucky roll makes the clear count for double the rewards
    let crit = false;
    if (state.config.critChance > 0) {
      const r = nextRandom(seed);
      seed = r.seed;
      crit = r.value < state.config.critChance;
    }
    const mult = crit ? 2 : 1;
    board = clearRows(board, rows);
    score += scoreForClear(rows.length, level) * mult;
    lines += rows.length * mult;
    level = levelForLines(lines);
    charge = chargeForLines(charge, rows.length * mult, state.config.chargePerLine);
    boss = damageBoss(boss, rows.length * mult);
    lastClear = { rows, lines: rows.length, isOverflow: rows.length === 4, crit };
  }

  const base: GameState = { ...state, board, score, lines, level, charge, boss, seed, lastClear, grounded: false, lockX };

  if (boss.hp <= 0) return { ...base, active: null, phase: "won", event: "bosshit" };

  const spawned = spawnNext(base);
  // After a lock, the renderer cares about the lock/overflow, not the spawn tag.
  const event: GameState["event"] = lastClear?.isOverflow ? "overflow" : "lock";
  return { ...spawned, lastClear, event };
}

function tryRotate(state: GameState, dir: 1 | -1): GameState {
  const p = state.active;
  if (!p) return state;
  const to = ((((p.rot + dir) % 4) + 4) % 4) as Rot;
  if (p.kind === "O") return { ...state, active: { ...p, rot: to }, event: "rotate" };
  const table = p.kind === "I" ? KICKS.I : KICKS.JLSTZ;
  const kicks = table[kickKey(p.rot, to)];
  for (const [dx, dy] of kicks) {
    const cand: Piece = { ...p, rot: to, x: p.x + dx, y: p.y - dy }; // SRS y is up-positive
    if (!collides(state.board, cand)) {
      return { ...state, active: cand, event: "rotate", grounded: false };
    }
  }
  return state;
}

export function reduce(state: GameState, action: Action): GameState {
  const s = { ...state, event: null as GameState["event"], lastClear: null as ClearEvent | null };

  switch (action.type) {
    case "START": {
      const fresh: GameState = {
        ...initialState(),
        seed: action.seed,
        phase: "playing",
        config: { ...DEFAULT_CONFIG, ...action.config },
      };
      return spawnNext({ ...fresh, charge: fresh.config.startCharge });
    }
    case "PAUSE":
      return s.phase === "playing" ? { ...s, phase: "paused" } : s;
    case "RESUME":
      return s.phase === "paused" ? { ...s, phase: "playing" } : s;
  }

  if (s.phase !== "playing" || !s.active) return s;

  switch (action.type) {
    case "MOVE": {
      const cand = { ...s.active, x: s.active.x + action.dir };
      if (collides(s.board, cand)) return s;
      return { ...s, active: cand, event: "move", grounded: collides(s.board, { ...cand, y: cand.y + 1 }) };
    }
    case "ROTATE":
      return tryRotate(s, action.dir);
    case "SOFT_DROP": {
      const cand = { ...s.active, y: s.active.y + 1 };
      if (collides(s.board, cand)) return { ...s, grounded: true };
      return { ...s, active: cand, score: s.score + 1, event: "move" };
    }
    case "HARD_DROP": {
      const y = ghostDrop(s.board, s.active);
      const dropped = (y - s.active.y) * 2;
      return lockPiece({ ...s, active: { ...s.active, y }, score: s.score + dropped });
    }
    case "TICK": {
      const slowTicks = Math.max(0, s.slowTicks - 1);
      const cand = { ...s.active, y: s.active.y + 1 };
      if (collides(s.board, cand)) return { ...s, grounded: true, slowTicks };
      return { ...s, active: cand, slowTicks };
    }
    case "LOCK":
      return lockPiece(s);
    case "HOLD": {
      if (!s.canHold) return s;
      const cur = s.active.kind;
      const max = s.config.holdSlots;
      if (s.holds.length < max) {
        // bank: store the current piece, spawn the next
        const spawned = spawnNext({ ...s, holds: [...s.holds, cur] });
        return { ...spawned, canHold: false, event: "hold" };
      }
      // full: swap the front piece out, append the current to the back
      const out = s.holds[0];
      const swapped = spawnPiece(out);
      if (collides(s.board, swapped)) return s;
      return { ...s, active: swapped, holds: [...s.holds.slice(1), cur], canHold: false, event: "hold" };
    }
    case "USE_POWERUP": {
      if (!canAfford(s.charge, action.id)) return s;
      const charge = s.charge - costOf(action.id);
      if (action.id === "bomb") return { ...s, charge, board: applyBomb(s.board, s.active), event: "powerup" };
      if (action.id === "laser") return { ...s, charge, board: applyLaser(s.board), event: "powerup" };
      return { ...s, charge, slowTicks: SLOW_TICKS, event: "powerup" }; // slow
    }
    case "BOSS_ATTACK": {
      const { board, seed, toppedOut } = injectGarbage(s.board, 1, s.seed, s.config.garbageGaps);
      if (toppedOut) return { ...s, board, seed, phase: "over", event: "lock" };
      return { ...s, board, seed, event: "bossattack" };
    }
    default:
      return s;
  }
}

/** Convenience for the renderer: current ghost-drop y of the active piece. */
export function ghostY(state: GameState): number | null {
  return state.active ? ghostDrop(state.board, state.active) : null;
}
