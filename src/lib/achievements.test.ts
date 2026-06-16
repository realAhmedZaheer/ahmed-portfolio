import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  ACHIEVEMENTS,
  ACH_EVENT,
  ACH_KEY,
  getUnlocked,
  isUnlocked,
  unlock,
  recordVisit,
  MAIN_SCREENS,
} from "./achievements";

beforeEach(() => {
  window.localStorage.clear();
});

describe("achievements lib", () => {
  it("ships a registry of 10 with unique ids", () => {
    expect(ACHIEVEMENTS).toHaveLength(10);
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(10);
  });

  it("starts with nothing unlocked", () => {
    expect(getUnlocked().size).toBe(0);
    expect(isUnlocked("campaign-clear")).toBe(false);
  });

  it("unlock persists and dispatches ACH_EVENT", () => {
    const spy = vi.fn();
    window.addEventListener(ACH_EVENT, spy);
    unlock("campaign-clear");
    expect(isUnlocked("campaign-clear")).toBe(true);
    expect(window.localStorage.getItem(ACH_KEY)).toContain("campaign-clear");
    expect(spy).toHaveBeenCalledTimes(1);
    window.removeEventListener(ACH_EVENT, spy);
  });

  it("unlock is idempotent - second call dispatches nothing", () => {
    const spy = vi.fn();
    unlock("sound-on");
    window.addEventListener(ACH_EVENT, spy);
    unlock("sound-on");
    expect(spy).not.toHaveBeenCalled();
    window.removeEventListener(ACH_EVENT, spy);
  });

  it("recordVisit rolls up to full-tour only when ALL main screens seen", () => {
    MAIN_SCREENS.slice(0, -1).forEach((p) => recordVisit(p));
    expect(isUnlocked("full-tour")).toBe(false);
    recordVisit(MAIN_SCREENS[MAIN_SCREENS.length - 1]);
    expect(isUnlocked("full-tour")).toBe(true);
  });

  it("swallows storage errors", () => {
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error("quota");
    };
    expect(() => unlock("first-contact")).not.toThrow();
    Storage.prototype.setItem = orig;
  });
});
