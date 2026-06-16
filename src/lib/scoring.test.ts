import { describe, it, expect } from "vitest";
import { weightedScore, type Stage } from "./scoring";

const stages: Stage[] = [
  { key: "sharpness", label: "Sharpness", weight: 2 },
  { key: "dedup", label: "Uniqueness", weight: 1 },
  { key: "detect", label: "Objects", weight: 1 },
];

describe("weightedScore", () => {
  it("returns 100 for all-perfect", () => {
    expect(weightedScore(stages, { sharpness: 1, dedup: 1, detect: 1 })).toBe(100);
  });
  it("weights stages correctly", () => {
    // (2*0.5 + 1*1 + 1*0)/4 = 0.5 → 50
    expect(weightedScore(stages, { sharpness: 0.5, dedup: 1, detect: 0 })).toBe(50);
  });
  it("treats missing scores as 0", () => {
    expect(weightedScore(stages, { sharpness: 1 })).toBe(50); // 2/4
  });
  it("returns 0 when there are no stages", () => {
    expect(weightedScore([], {})).toBe(0);
  });
});
