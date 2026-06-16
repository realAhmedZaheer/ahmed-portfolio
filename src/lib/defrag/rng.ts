import type { PieceKind } from "./types";

const ALL: PieceKind[] = ["I", "O", "T", "S", "Z", "J", "L"];

/** Pure LCG step: returns a value in [0,1) and the advanced seed. */
export function nextRandom(seed: number): { value: number; seed: number } {
  // mulberry32
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, seed: t | 0 };
}

/** Fisher-Yates shuffle of the 7-bag using the seeded RNG. Returns [bag, newSeed]. */
export function shuffleBag(seed: number): [PieceKind[], number] {
  const bag = [...ALL];
  let s = seed;
  for (let i = bag.length - 1; i > 0; i--) {
    const r = nextRandom(s);
    s = r.seed;
    const j = Math.floor(r.value * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return [bag, s];
}
