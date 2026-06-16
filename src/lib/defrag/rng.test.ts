import { describe, it, expect } from "vitest";
import { nextRandom, shuffleBag } from "./rng";

describe("rng", () => {
  it("is deterministic for a given seed", () => {
    const a = nextRandom(123);
    const b = nextRandom(123);
    expect(a.value).toBe(b.value);
    expect(a.seed).toBe(b.seed);
    expect(a.value).toBeGreaterThanOrEqual(0);
    expect(a.value).toBeLessThan(1);
  });

  it("shuffleBag returns all 7 kinds, permuted deterministically", () => {
    const [bag1] = shuffleBag(42);
    const [bag2] = shuffleBag(42);
    expect([...bag1].sort().join("")).toBe("IJLOSTZ");
    expect(bag1).toEqual(bag2);
  });

  it("advances the seed so consecutive bags differ", () => {
    const [bagA, seedA] = shuffleBag(42);
    const [bagB] = shuffleBag(seedA);
    expect(bagB).not.toEqual(bagA); // overwhelmingly likely
  });
});
