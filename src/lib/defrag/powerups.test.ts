import { describe, it, expect } from "vitest";
import { POWERUPS, applyBomb, applyLaser, chargeForLines, canAfford } from "./powerups";
import { emptyBoard } from "./board";
import { spawnPiece } from "./pieces";
import { ROWS, COLS } from "./types";

describe("powerups", () => {
  it("registers bomb/laser/slow with costs", () => {
    expect(POWERUPS.map((p) => p.id).sort()).toEqual(["bomb", "laser", "slow"]);
    expect(POWERUPS.find((p) => p.id === "laser")!.cost).toBe(60);
  });

  it("bomb clears a 3x3 around the active piece center", () => {
    let b = emptyBoard();
    for (let r = ROWS - 3; r < ROWS; r++) for (let c = 0; c < COLS; c++) b[r][c] = "#fff";
    const p = { ...spawnPiece("O"), y: ROWS - 2 };
    b = applyBomb(b, p);
    expect(b[ROWS - 1][4]).toBeNull();
    expect(b[ROWS - 2][5]).toBeNull();
    expect(b[ROWS - 1][0]).toBe("#fff");
  });

  it("laser vaporizes the lowest filled row and collapses the stack onto it", () => {
    let b = emptyBoard();
    for (let c = 0; c < COLS; c++) b[ROWS - 1][c] = "#aaa"; // lowest filled row
    b[ROWS - 2][3] = "#bbb"; // a marker sitting on top of it
    b = applyLaser(b);
    expect(b[ROWS - 1][3]).toBe("#bbb"); // marker dropped one row into the gap
    expect(b[ROWS - 1][0]).toBeNull(); // old full row is gone, not left empty in place
    expect(b[ROWS - 2][3]).toBeNull(); // marker no longer floats above
  });

  it("charge fills 20 per line capped at 100; affordability checks cost", () => {
    expect(chargeForLines(0, 2)).toBe(40);
    expect(chargeForLines(90, 1)).toBe(100);
    expect(canAfford(100, "bomb")).toBe(true);
    expect(canAfford(50, "bomb")).toBe(false);
  });

  it("charge respects a custom per-line rate", () => {
    expect(chargeForLines(0, 2, 30)).toBe(60);
    expect(chargeForLines(80, 1, 30)).toBe(100); // capped
  });
});
