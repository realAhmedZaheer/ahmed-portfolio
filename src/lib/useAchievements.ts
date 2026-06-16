"use client";
import { useEffect, useState } from "react";
import {
  ACH_EVENT,
  ACHIEVEMENTS,
  getUnlocked,
  type AchievementId,
} from "@/lib/achievements";

/** Live unlocked-achievement state; SSR-safe (empty until mount). */
export function useAchievements(): {
  unlocked: Set<AchievementId>;
  count: number;
  total: number;
} {
  const [unlocked, setUnlocked] = useState<Set<AchievementId>>(new Set());
  useEffect(() => {
    const sync = () => setUnlocked(getUnlocked());
    sync();
    window.addEventListener(ACH_EVENT, sync);
    return () => window.removeEventListener(ACH_EVENT, sync);
  }, []);
  return { unlocked, count: unlocked.size, total: ACHIEVEMENTS.length };
}
