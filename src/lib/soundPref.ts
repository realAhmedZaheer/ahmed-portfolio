export const SOUND_KEY = "az_sound_v1";
export const SOUND_EVENT = "az-sound-change";

export type SoundPref = "on" | "off";

/** Read the stored sound preference, or null if unanswered. */
export function getStoredSoundPref(storage: Storage): SoundPref | null {
  try {
    const v = storage.getItem(SOUND_KEY);
    return v === "on" || v === "off" ? v : null;
  } catch {
    return null;
  }
}

/** Persist the choice and notify listeners. */
export function setSoundPref(storage: Storage, pref: SoundPref): void {
  try {
    storage.setItem(SOUND_KEY, pref);
  } catch {
    /* storage may be disabled */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SOUND_EVENT));
  }
}

/** Whether SFX should play right now (default off). */
export function isSoundOn(): boolean {
  if (typeof window === "undefined") return false;
  return getStoredSoundPref(window.localStorage) === "on";
}
