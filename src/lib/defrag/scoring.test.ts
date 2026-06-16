import { describe, it, expect } from "vitest";
import { scoreForClear, levelForLines, dropIntervalMs } from "./scoring";

describe("scoring", () => {
  it("scores 1/2/3/4 line clears by level", () => {
    expect(scoreForClear(1, 1)).toBe(100);
    expect(scoreForClear(2, 1)).toBe(300);
    expect(scoreForClear(3, 1)).toBe(500);
    expect(scoreForClear(4, 1)).toBe(800);
    expect(scoreForClear(4, 3)).toBe(2400);
    expect(scoreForClear(0, 5)).toBe(0);
  });

  it("levels up every 10 lines, starting at level 1", () => {
    expect(levelForLines(0)).toBe(1);
    expect(levelForLines(9)).toBe(1);
    expect(levelForLines(10)).toBe(2);
    expect(levelForLines(25)).toBe(3);
  });

  it("gravity speeds up per level and clamps at a floor", () => {
    expect(dropIntervalMs(1)).toBeGreaterThan(dropIntervalMs(5));
    expect(dropIntervalMs(20)).toBeGreaterThanOrEqual(60);
    expect(dropIntervalMs(1, 2)).toBe(dropIntervalMs(1) * 2);
  });
});
