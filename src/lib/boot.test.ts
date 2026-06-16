import { describe, it, expect, beforeEach } from "vitest";
import {
  shouldPlayBoot,
  markBootSeen,
  markBootPlayedThisLoad,
  resetBootPlayedForTests,
  BOOT_KEY,
  BOOT_ALWAYS_PLAY,
} from "./boot";

function fakeStorage(): Storage {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
    clear: () => m.clear(),
    key: () => null,
    length: 0,
  } as Storage;
}

beforeEach(() => {
  resetBootPlayedForTests();
});

describe("boot state", () => {
  it("only force-replays in development (production is first-visit-only)", () => {
    // Guard against shipping the every-load behavior to production.
    expect(BOOT_ALWAYS_PLAY).toBe(process.env.NODE_ENV === "development");
    if (process.env.NODE_ENV === "production") expect(BOOT_ALWAYS_PLAY).toBe(false);
  });

  it("plays on first visit, never again after markBootSeen", () => {
    const s = fakeStorage();
    expect(shouldPlayBoot(s)).toBe(true);
    markBootSeen(s);
    expect(shouldPlayBoot(s)).toBe(false);
    expect(s.getItem(BOOT_KEY)).toBe("1");
  });

  it("never replays within the same page load (in-app navigation back to home)", () => {
    const s = fakeStorage();
    expect(shouldPlayBoot(s)).toBe(true);
    markBootPlayedThisLoad();
    expect(shouldPlayBoot(s)).toBe(false);
  });
});
