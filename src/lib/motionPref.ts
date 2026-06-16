export const MOTION_KEY = "az_motion_v1";
export const MOTION_EVENT = "az-motion-change";

export type MotionPref = "full" | "reduced";

/** Read the stored motion preference, or null if unanswered. */
export function getStoredMotionPref(storage: Storage): MotionPref | null {
  try {
    const v = storage.getItem(MOTION_KEY);
    return v === "full" || v === "reduced" ? v : null;
  } catch {
    return null;
  }
}

/** Persist the choice, update the DOM attribute, and notify listeners. */
export function setMotionPref(storage: Storage, pref: MotionPref): void {
  try {
    storage.setItem(MOTION_KEY, pref);
  } catch {
    /* storage may be disabled */
  }
  if (typeof document !== "undefined") {
    document.documentElement.dataset.motion = pref;
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MOTION_EVENT));
  }
}

/** Whether motion should be reduced: explicit user choice wins, then OS preference. */
export function isReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  const stored = getStoredMotionPref(window.localStorage);
  if (stored) return stored === "reduced";
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}
