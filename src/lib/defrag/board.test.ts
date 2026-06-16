import { describe, it, expect } from "vitest";
import { emptyBoard, pieceCells, collides, merge, fullRows, clearRows, injectGarbage, ghostDrop } from "./board";
import { spawnPiece } from "./pieces";
import { ROWS, COLS } from "./types";

describe("board", () => {
  it("emptyBoard is ROWS x COLS of null", () => {
    const b = emptyBoard();
    expect(b).toHaveLength(ROWS);
    expect(b[0]).toHaveLength(COLS);
    expect(b.flat().every((c) => c === null)).toBe(true);
  });

  it("pieceCells returns absolute [col,row] for a piece", () => {
    const cells = pieceCells(spawnPiece("O"));
    expect(cells).toContainEqual([4, 0]);
    expect(cells).toContainEqual([5, 1]);
  });

  it("collides with floor and walls", () => {
    const b = emptyBoard();
    expect(collides(b, { kind: "O", rot: 0, x: 3, y: ROWS - 1 })).toBe(true);
    expect(collides(b, { kind: "O", rot: 0, x: -2, y: 0 })).toBe(true);
    expect(collides(b, { kind: "O", rot: 0, x: 3, y: 0 })).toBe(false);
  });

  it("merge writes the piece color into the board", () => {
    const b = merge(emptyBoard(), spawnPiece("O"));
    expect(b[0][4]).toBe("#fde047");
    expect(b[1][5]).toBe("#fde047");
  });

  it("fullRows finds complete rows; clearRows collapses them", () => {
    let b = emptyBoard();
    const last = ROWS - 1;
    b[last] = Array(COLS).fill("#fff");
    b[last - 1][0] = "#abc";
    expect(fullRows(b)).toEqual([last]);
    b = clearRows(b, [last]);
    expect(fullRows(b)).toEqual([]);
    expect(b[last][0]).toBe("#abc");
    expect(b).toHaveLength(ROWS);
  });

  it("injectGarbage pushes the stack up and adds rows with a single gap", () => {
    const b0 = emptyBoard();
    b0[ROWS - 1][0] = "#aaa";
    const { board: b, toppedOut } = injectGarbage(b0, 1);
    expect(b).toHaveLength(ROWS);
    const bottom = b[ROWS - 1];
    expect(bottom.filter((c) => c === null)).toHaveLength(1);
    expect(b[ROWS - 2][0]).toBe("#aaa");
    expect(toppedOut).toBe(false);
  });

  it("injectGarbage can carve multiple gaps per row", () => {
    const { board: b } = injectGarbage(emptyBoard(), 1, 1, 2);
    expect(b[ROWS - 1].filter((c) => c === null)).toHaveLength(2);
  });

  it("injectGarbage reports a top-out when filled rows are pushed off the top", () => {
    const b0 = emptyBoard();
    b0[0] = Array(COLS).fill("#fff");
    const { toppedOut } = injectGarbage(b0, 1);
    expect(toppedOut).toBe(true);
  });

  it("injectGarbage advances the seed for the next call", () => {
    const a = injectGarbage(emptyBoard(), 1, 42);
    expect(a.seed).not.toBe(42);
  });

  it("ghostDrop returns the lowest non-colliding y for the active piece", () => {
    const b = emptyBoard();
    const p = spawnPiece("O");
    const gy = ghostDrop(b, p);
    expect(gy).toBe(ROWS - 2);
  });
});
