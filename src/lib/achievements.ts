export type AchievementId =
  | "campaign-clear"
  | "full-tour"
  | "first-contact"
  | "side-quest"
  | "sound-on"
  | "escape-artist"
  | "defrag-first"
  | "defrag-overflow"
  | "defrag-boss"
  | "defrag-upgrade";

export interface Achievement {
  id: AchievementId;
  title: string;
  desc: string;
  hint: string;
}

export const ACH_KEY = "az_ach_v1";
export const ACH_VISIT_KEY = "az_ach_visit_v1";
export const ACH_EVENT = "az-ach-unlock";

/** The 5 main progression screens. */
export const MAIN_SCREENS = [
  "/player",
  "/stats",
  "/work",
  "/campaign",
  "/contact",
] as const;

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "campaign-clear",
    title: "CAMPAIGN CLEARED",
    desc: "Reached the end of the campaign log and hit FINISH.",
    hint: "Play through to the campaign log finale.",
  },
  {
    id: "full-tour",
    title: "ROLL CALL",
    desc: "Visited every screen in the main progression.",
    hint: "Visit all five main screens.",
  },
  {
    id: "first-contact",
    title: "FIRST CONTACT",
    desc: "Made it to the contact screen.",
    hint: "Reach the final screen.",
  },
  {
    id: "side-quest",
    title: "CUSTOM ORDER FILLED",
    desc: "Forged a custom demo in the side quest.",
    hint: "Complete a SIDE QUEST forge.",
  },
  {
    id: "sound-on",
    title: "NOW YOU'RE PLAYING",
    desc: "Turned the chiptune sound on.",
    hint: "Flip the ♪ sound toggle on.",
  },
  {
    id: "escape-artist",
    title: "RETREAT",
    desc: "Bailed back to the title screen with ESC.",
    hint: "Press ESC on any screen.",
  },
  {
    id: "defrag-first",
    title: "JACKED IN",
    desc: "Booted up DEFRAG.EXE.",
    hint: "Play DEFRAG.EXE in the arcade.",
  },
  {
    id: "defrag-overflow",
    title: "STACK OVERFLOW",
    desc: "Cleared four sectors at once.",
    hint: "Clear 4 lines in one move.",
  },
  {
    id: "defrag-boss",
    title: "FIREWALL BREACHED",
    desc: "Terminated GATEKEEPER.SYS.",
    hint: "Defeat the first firewall.",
  },
  {
    id: "defrag-upgrade",
    title: "REQUISITIONED",
    desc: "Bought your first upgrade from TERMINAL SUPPLY.",
    hint: "Buy any upgrade in the arcade.",
  },
];

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? new Set(arr.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* storage may be full or disabled */
  }
}

export function getUnlocked(): Set<AchievementId> {
  return readSet(ACH_KEY) as Set<AchievementId>;
}

export function isUnlocked(id: AchievementId): boolean {
  return getUnlocked().has(id);
}

/** Unlock an achievement (idempotent). */
export function unlock(id: AchievementId): void {
  const set = getUnlocked();
  if (set.has(id)) return;
  set.add(id);
  writeSet(ACH_KEY, set);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ACH_EVENT, { detail: { id } }));
  }
}

/** Record a screen visit; unlocks full-tour once all main screens are seen. */
export function recordVisit(path: string): void {
  if (!(MAIN_SCREENS as readonly string[]).includes(path)) return;
  const seen = readSet(ACH_VISIT_KEY);
  if (!seen.has(path)) {
    seen.add(path);
    writeSet(ACH_VISIT_KEY, seen);
  }
  if (MAIN_SCREENS.every((p) => seen.has(p))) unlock("full-tour");
}
