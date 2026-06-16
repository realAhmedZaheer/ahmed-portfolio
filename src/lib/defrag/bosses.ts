import type { BossState } from "./types";

export const GATEKEEPER_MAX_HP = 30;

export function makeGatekeeper(): BossState {
  return {
    id: "gatekeeper",
    name: "GATEKEEPER.SYS",
    hp: GATEKEEPER_MAX_HP,
    maxHp: GATEKEEPER_MAX_HP,
    attackEveryMs: 12000,
  };
}

/** Apply damage; below 50% HP the firewall escalates its attack cadence. */
export function damageBoss(boss: BossState, amount: number): BossState {
  const hp = Math.max(0, boss.hp - amount);
  const attackEveryMs = hp <= boss.maxHp / 2 ? 8000 : 12000;
  return { ...boss, hp, attackEveryMs };
}

/** GATEKEEPER.SYS voice line for a given HP fraction (1 → 0). Renderer flashes these. */
export function bossVoiceFor(hpFraction: number): string {
  if (hpFraction <= 0) return "> PROCESS TERMINATED BY OPERATOR";
  if (hpFraction <= 0.25) return "> CONTAINMENT FAILING - █████";
  if (hpFraction <= 0.5) return "> ANOMALOUS THROUGHPUT. ESCALATING.";
  return "> UNAUTHORIZED WRITE DETECTED";
}

export const BOSS_SPAWN_LINE = "> UNAUTHORIZED WRITE DETECTED";
export const BOSS_ATTACK_LINE = "> INCOMING: GARBAGE INJECTION";
export const BOSS_DEFEAT_LINE = "> PROCESS TERMINATED BY OPERATOR";
export const BOSS_TOPOUT_LINE = "> INTRUSION NEUTRALIZED. SECTOR LOCKED.";
