"use client";
import { useEffect, useRef, useState } from "react";
import {
  ACH_EVENT,
  ACHIEVEMENTS,
  type Achievement,
  type AchievementId,
} from "@/lib/achievements";
import { playSound } from "@/lib/sfx";
import { TrophyPixel } from "./TrophyPixel";

const HOLD_MS = 3500;

function byId(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === (id as AchievementId));
}

/** Corner toast for achievement unlocks, queued sequentially. */
export function AchievementToaster() {
  const [current, setCurrent] = useState<Achievement | null>(null);
  const queue = useRef<Achievement[]>([]);
  const showing = useRef(false);

  useEffect(() => {
    const next = () => {
      const item = queue.current.shift();
      if (!item) {
        showing.current = false;
        setCurrent(null);
        return;
      }
      showing.current = true;
      setCurrent(item);
      playSound("achievement");
      window.setTimeout(next, HOLD_MS);
    };

    const onUnlock = (e: Event) => {
      const id = (e as CustomEvent<{ id: string }>).detail?.id;
      const ach = id ? byId(id) : undefined;
      if (!ach) return;
      queue.current.push(ach);
      if (!showing.current) next();
    };

    window.addEventListener(ACH_EVENT, onUnlock);
    return () => window.removeEventListener(ACH_EVENT, onUnlock);
  }, []);

  if (!current) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="ach-toast pixel-corners fixed bottom-16 right-4 z-[120] flex items-center gap-3 border-2 border-yellow/70 bg-bg2/95 px-4 py-3 [box-shadow:0_0_22px_rgba(253,224,71,.4)]"
    >
      <TrophyPixel size={44} />
      <div className="pr-1">
        <p className="font-pixel text-[7px] text-yellow">ACHIEVEMENT UNLOCKED</p>
        <p className="font-pixel mt-1 text-[9px] text-white">{current.title}</p>
      </div>
    </div>
  );
}
