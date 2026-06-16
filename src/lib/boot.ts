export const BOOT_KEY = "az_boot_seen_v1";

/** In dev mode, replay boot every load; in prod, first-visit-only. */
export const BOOT_ALWAYS_PLAY = process.env.NODE_ENV === "development";

/** Module-scoped flag: survives client-side navigation, resets on full page load. */
let playedThisPageLoad = false;

export function markBootPlayedThisLoad(): void {
  playedThisPageLoad = true;
}

/** Test-only helper. */
export function resetBootPlayedForTests(): void {
  playedThisPageLoad = false;
}

export function shouldPlayBoot(storage: Storage): boolean {
  if (playedThisPageLoad) return false;
  if (BOOT_ALWAYS_PLAY) return true;
  try {
    return storage.getItem(BOOT_KEY) !== "1";
  } catch {
    return true;
  }
}

export function markBootSeen(storage: Storage): void {
  try {
    storage.setItem(BOOT_KEY, "1");
  } catch {
    /* storage may be disabled */
  }
}
