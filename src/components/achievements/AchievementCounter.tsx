"use client";
import { useState } from "react";
import { useAchievements } from "@/lib/useAchievements";
import { playSound } from "@/lib/sfx";
import { AchievementPanel } from "./AchievementPanel";

/** HUD button showing 🏆 n/total; opens the achievements viewer panel. */
export function AchievementCounter() {
  const { unlocked, count, total } = useAchievements();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          playSound("confirm");
          setOpen(true);
        }}
        aria-label={`Achievements - ${count} of ${total} unlocked`}
        className="font-pixel gx inline-flex items-center gap-1 text-[8px] text-yellow hover:text-white"
      >
        <span aria-hidden>🏆</span>
        {count}/{total}
      </button>
      {open && <AchievementPanel unlocked={unlocked} onClose={() => setOpen(false)} />}
    </>
  );
}
