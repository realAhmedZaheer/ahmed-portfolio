import { describe, it, expect, beforeEach } from "vitest";
import { getStoredSoundPref, setSoundPref, isSoundOn, SOUND_KEY } from "./soundPref";

beforeEach(() => {
  window.localStorage.clear();
});

describe("soundPref", () => {
  it("defaults to off (null) until answered", () => {
    expect(getStoredSoundPref(window.localStorage)).toBeNull();
    expect(isSoundOn()).toBe(false);
  });

  it("stores and reflects the choice", () => {
    setSoundPref(window.localStorage, "on");
    expect(getStoredSoundPref(window.localStorage)).toBe("on");
    expect(window.localStorage.getItem(SOUND_KEY)).toBe("on");
    expect(isSoundOn()).toBe(true);
    setSoundPref(window.localStorage, "off");
    expect(isSoundOn()).toBe(false);
  });
});
