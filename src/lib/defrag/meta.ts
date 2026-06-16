import type { RunConfig } from "./types";

export const META_KEY = "az_defrag_meta_v1";
export const HISCORE_KEY = "az_defrag_hi_v1";

export interface DefragMeta { bits: number; upgrades: Record<string, number>; }

export interface Upgrade {
  id: string;
  path: string;    // fake system path, shown as the name
  flavor: string;  // dim one-liner from the system's POV
  costs: number[]; // costs[level-1] = cost of that level; length = max level
  apply: (cfg: RunConfig, level: number) => void;
}

/** TERMINAL SUPPLY - the seven black-market upgrades (creative-direction). */
export const UPGRADES: Upgrade[] = [
  {
    id: "start-bomb", path: "SYS/CACHE/EXPLOSIVE.DAT", flavor: "Flagged for deletion. Handle with care.",
    costs: [200], apply: (c) => { c.startCharge = 100; }
  },
  {
    id: "queue-plus", path: "USR/PREFS/LOOKAHEAD.CFG", flavor: "Extended prediction buffer. Unauthorized modification.",
    costs: [150], apply: (c) => { c.queueSize = 6; }
  },
  {
    id: "slow-grav", path: "SYS/KERNEL/TIMESCALE.MOD", flavor: "Temporal subsystem patch. Side effects unknown.",
    costs: [250, 450, 700], apply: (c, l) => { c.gravityScale = [1.15, 1.3, 1.4][l - 1]; }
  },
  {
    id: "hold-two", path: "SYS/SWAP/DUAL-BUFFER.SYS", flavor: "Second hold register. Not in the official spec.",
    costs: [300], apply: (c) => { c.holdSlots = 2; }
  },
  {
    id: "garbage-res", path: "USR/ARMOR/JUNK-FILTER.BIN", flavor: "Garbage rows arrive with two gaps instead of one.",
    costs: [200], apply: (c) => { c.garbageGaps = 2; }
  },
  {
    id: "charge-rate", path: "SYS/POWER/OVERCLOCK.INI", flavor: "Increased power draw from clear operations.",
    costs: [175, 300], apply: (c, l) => { c.chargePerLine = [25, 30][l - 1]; }
  },
  {
    id: "crit-clear", path: "DEV/NULL/ANOMALY.EXE", flavor: "10% chance of anomalous double-clear. Use at own risk.",
    costs: [350], apply: (c) => { c.critChance = 0.1; }
  },
];

export function getMeta(): DefragMeta {
  if (typeof window === "undefined") return { bits: 0, upgrades: {} };
  try {
    const raw = window.localStorage.getItem(META_KEY);
    if (!raw) return { bits: 0, upgrades: {} };
    const parsed = JSON.parse(raw);
    const upgrades: Record<string, number> = {};
    if (Array.isArray(parsed.upgrades)) {
      for (const id of parsed.upgrades) upgrades[String(id)] = 1; // migrate old string[] shape
    } else if (parsed.upgrades && typeof parsed.upgrades === "object") {
      for (const [k, v] of Object.entries(parsed.upgrades)) upgrades[k] = Number(v) || 0;
    }
    return { bits: Number(parsed.bits) || 0, upgrades };
  } catch {
    return { bits: 0, upgrades: {} };
  }
}

function writeMeta(m: DefragMeta): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(META_KEY, JSON.stringify(m)); } catch { /* ignore */ }
}

export function getBits(): number { return getMeta().bits; }
export function addBits(n: number): void { const m = getMeta(); writeMeta({ ...m, bits: m.bits + n }); }
export function spendBits(n: number): void { const m = getMeta(); writeMeta({ ...m, bits: Math.max(0, m.bits - n) }); }
export function levelOf(id: string): number { return getMeta().upgrades[id] ?? 0; }

export function nextCost(id: string): number | null {
  const up = UPGRADES.find((u) => u.id === id);
  if (!up) return null;
  const lvl = levelOf(id);
  return lvl < up.costs.length ? up.costs[lvl] : null;
}

/** Buy the next tier of an upgrade if affordable and not maxed. */
export function buyUpgrade(id: string): boolean {
  const up = UPGRADES.find((u) => u.id === id);
  if (!up) return false;
  const m = getMeta();
  const lvl = m.upgrades[id] ?? 0;
  if (lvl >= up.costs.length) return false;      // maxed
  const cost = up.costs[lvl];
  if (m.bits < cost) return false;               // unaffordable
  writeMeta({ bits: m.bits - cost, upgrades: { ...m.upgrades, [id]: lvl + 1 } });
  return true;
}

export function getHiScore(): number {
  if (typeof window === "undefined") return 0;
  try { return Number(window.localStorage.getItem(HISCORE_KEY)) || 0; } catch { return 0; }
}
export function setHiScore(score: number): void {
  if (typeof window === "undefined") return;
  try { if (score > getHiScore()) window.localStorage.setItem(HISCORE_KEY, String(score)); } catch { /* ignore */ }
}

/** Fold every owned upgrade level into a fresh RunConfig. */
export function applyUpgrades(config: RunConfig): RunConfig {
  const cfg = { ...config };
  const owned = getMeta().upgrades;
  for (const up of UPGRADES) {
    const lvl = owned[up.id] ?? 0;
    if (lvl > 0) up.apply(cfg, lvl);
  }
  return cfg;
}
