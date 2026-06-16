import { describe, it, expect } from "vitest";
import { PIECES, PIECE_COLORS, KICKS, spawnPiece } from "./pieces";

describe("pieces", () => {
  it("defines 7 kinds, each with 4 rotation states of 4 cells", () => {
    const kinds = Object.keys(PIECES);
    expect(kinds.sort().join("")).toBe("IJLOSTZ");
    for (const k of kinds) {
      expect(PIECES[k as keyof typeof PIECES]).toHaveLength(4);
      for (const rot of PIECES[k as keyof typeof PIECES]) expect(rot).toHaveLength(4);
    }
  });

  it("gives every kind a distinct hex color", () => {
    const colors = Object.values(PIECE_COLORS);
    expect(new Set(colors).size).toBe(colors.length);
    expect(PIECE_COLORS.I).toBe("#22d3ee");
    expect(PIECE_COLORS.T).toBe("#a855f7");
  });

  it("provides JLSTZ and I kick tables for each rotation transition", () => {
    expect(KICKS.JLSTZ["0>1"]).toHaveLength(5);
    expect(KICKS.I["0>1"]).toHaveLength(5);
  });

  it("spawnPiece centers the piece near the top buffer", () => {
    const p = spawnPiece("T");
    expect(p.kind).toBe("T");
    expect(p.rot).toBe(0);
    expect(p.x).toBe(3);
    expect(p.y).toBe(0);
  });
});
