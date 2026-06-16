import { describe, it, expect } from "vitest";
import { initialState, reduce } from "./engine";
import { ROWS, COLS } from "./types";

const start = () => reduce(initialState(), { type: "START", seed: 7 });

describe("engine", () => {
  it("START spawns an active piece and fills the queue", () => {
    const s = start();
    expect(s.phase).toBe("playing");
    expect(s.active).not.toBeNull();
    expect(s.queue).toHaveLength(5);
    expect(s.boss.hp).toBe(s.boss.maxHp);
  });

  it("MOVE shifts the active piece and clamps at walls", () => {
    let s = start();
    const x0 = s.active!.x;
    s = reduce(s, { type: "MOVE", dir: -1 });
    expect(s.active!.x).toBe(x0 - 1);
    s.active = { ...s.active!, x: 0 };
    const blocked = reduce(s, { type: "MOVE", dir: -1 });
    expect(blocked.active!.x).toBe(0);
  });

  it("HARD_DROP locks the piece and spawns the next", () => {
    let s = start();
    s = reduce(s, { type: "HARD_DROP" });
    expect(s.board.flat().some((c) => c !== null)).toBe(true);
    expect(s.active).not.toBeNull();
    expect(s.event).toBe("lock");
  });

  it("TICK grounds a piece that cannot fall, then LOCK merges it", () => {
    let s = start();
    for (let i = 0; i < ROWS + 2; i++) s = reduce(s, { type: "TICK" });
    expect(s.grounded).toBe(true);
    const filledBefore = s.board.flat().filter(Boolean).length;
    s = reduce(s, { type: "LOCK" });
    expect(s.board.flat().filter(Boolean).length).toBeGreaterThanOrEqual(filledBefore);
    expect(s.grounded).toBe(false);
  });

  it("clearing lines scores, counts, damages the boss, and charges", () => {
    let s = start();
    s.board = s.board.map((row) => [...row]);
    const last = ROWS - 1;
    for (let c = 0; c < COLS; c++) s.board[last][c] = c === 4 || c === 5 ? null : "#fff";
    s.active = { kind: "O", rot: 0, x: 3, y: ROWS - 2 };
    const bossHp0 = s.boss.hp;
    s = reduce(s, { type: "HARD_DROP" });
    expect(s.lines).toBe(1);
    expect(s.score).toBe(100);
    expect(s.charge).toBe(20);
    expect(s.boss.hp).toBe(bossHp0 - 1);
    expect(s.lastClear?.lines).toBe(1);
  });

  it("crit-clear doubles score/charge/damage but clears only the real rows", () => {
    let s = reduce(initialState(), { type: "START", seed: 7, config: { critChance: 1 } });
    s.board = s.board.map((row) => [...row]);
    const last = ROWS - 1;
    for (let c = 0; c < COLS; c++) s.board[last][c] = c === 4 || c === 5 ? null : "#fff";
    s.active = { kind: "O", rot: 0, x: 3, y: ROWS - 2 };
    const hp0 = s.boss.hp;
    s = reduce(s, { type: "HARD_DROP" });
    expect(s.lines).toBe(2);
    expect(s.score).toBe(200);
    expect(s.charge).toBe(40);
    expect(s.boss.hp).toBe(hp0 - 2);
    expect(s.lastClear?.crit).toBe(true);
    expect(s.lastClear?.lines).toBe(1);
  });

  it("4-line clear flags overflow and emits the overflow event", () => {
    let s = start();
    s.board = s.board.map((row) => [...row]);
    for (let r = ROWS - 4; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) s.board[r][c] = c === 0 ? null : "#fff";
    s.active = { kind: "I", rot: 1, x: -2, y: ROWS - 4 };
    s = reduce(s, { type: "HARD_DROP" });
    expect(s.lines).toBe(4);
    expect(s.lastClear?.isOverflow).toBe(true);
    expect(s.event).toBe("overflow");
  });

  it("HOLD banks then swaps once per drop", () => {
    let s = start();
    const k = s.active!.kind;
    s = reduce(s, { type: "HOLD" });
    expect(s.holds[0]).toBe(k);
    expect(s.canHold).toBe(false);
    const k2 = s.active!.kind;
    s = reduce(s, { type: "HOLD" });
    expect(s.active!.kind).toBe(k2);
  });

  it("boss at 0 HP sets phase 'won'", () => {
    let s = start();
    s.boss = { ...s.boss, hp: 1 };
    s.board = s.board.map((row) => [...row]);
    const last = ROWS - 1;
    for (let c = 0; c < COLS; c++) s.board[last][c] = c === 4 || c === 5 ? null : "#fff";
    s.active = { kind: "O", rot: 0, x: 3, y: ROWS - 2 };
    s = reduce(s, { type: "HARD_DROP" });
    expect(s.phase).toBe("won");
  });

  it("top-out sets phase 'over'", () => {
    let s = start();
    s.board = s.board.map((row) => [...row]);
    // Block the spawn columns but leave col 0 empty so these rows aren't "full"
    // (a full row would clear on lock instead of blocking the next spawn).
    for (let r = 0; r < 4; r++) for (let c = 1; c < COLS; c++) s.board[r][c] = "#fff";
    s.active = { kind: "O", rot: 0, x: 3, y: ROWS - 2 };
    s = reduce(s, { type: "HARD_DROP" });
    expect(s.phase).toBe("over");
  });

  it("BOSS_ATTACK injects a garbage row", () => {
    let s = start();
    const before = s.board.flat().filter(Boolean).length;
    s = reduce(s, { type: "BOSS_ATTACK" });
    expect(s.board.flat().filter(Boolean).length).toBeGreaterThan(before);
    expect(s.event).toBe("bossattack");
  });

  it("USE_POWERUP spends charge and fires the effect", () => {
    let s = start();
    s.charge = 60;
    s.board = s.board.map((row) => [...row]);
    s.board[ROWS - 1][0] = "#fff";
    s = reduce(s, { type: "USE_POWERUP", id: "laser" });
    expect(s.charge).toBe(0);
    expect(s.board[ROWS - 1].every((c) => c === null)).toBe(true);
    expect(s.event).toBe("powerup");
  });
});
