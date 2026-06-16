import { describe, it, expect, beforeEach } from "vitest";
import {
  getStoredMotionPref,
  setMotionPref,
  isReducedMotion,
  MOTION_KEY,
} from "./motionPref";

beforeEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset.motion;
});

describe("motionPref", () => {
  it("returns null when unanswered, then the stored choice", () => {
    expect(getStoredMotionPref(window.localStorage)).toBeNull();
    setMotionPref(window.localStorage, "reduced");
    expect(getStoredMotionPref(window.localStorage)).toBe("reduced");
    expect(window.localStorage.getItem(MOTION_KEY)).toBe("reduced");
  });

  it("reflects the choice on <html data-motion>", () => {
    setMotionPref(window.localStorage, "full");
    expect(document.documentElement.dataset.motion).toBe("full");
  });

  it("explicit choice overrides the OS preference", () => {
    // setup stubs matchMedia to matches:false (OS = motion ok)
    setMotionPref(window.localStorage, "reduced");
    expect(isReducedMotion()).toBe(true);
    setMotionPref(window.localStorage, "full");
    expect(isReducedMotion()).toBe(false);
  });
});
