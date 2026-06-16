"use client";
import { useEffect, useRef } from "react";
import { ACHIEVEMENTS, type AchievementId } from "@/lib/achievements";
import { TrophyPixel } from "./TrophyPixel";

/** Modal list of every achievement: unlocked rows show the trophy + desc,
    locked rows show a ??? silhouette + hint. ESC / backdrop / button close.
    ESC is scoped here and stops propagation so it doesn't also bubble to the
    ScreenShell title-screen ESC handler. */
export function AchievementPanel({
  unlocked,
  onClose,
}: {
  unlocked: Set<AchievementId>;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Achievements"
      className="fixed inset-0 z-[125] flex items-center justify-center bg-bg/80 px-4"
      onClick={onClose}
    >
      <div
        className="pixel-corners max-h-[80vh] w-full max-w-md overflow-y-auto border-2 border-yellow/50 bg-bg2/98 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="font-pixel text-[10px] text-yellow">
            {unlocked.size} / {ACHIEVEMENTS.length} UNLOCKED
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="font-pixel gx text-[9px] text-dim hover:text-white"
            aria-label="Close achievements"
          >
            ✕
          </button>
        </div>

        <ul className="space-y-3">
          {ACHIEVEMENTS.map((a) => {
            const got = unlocked.has(a.id);
            return (
              <li
                key={a.id}
                className={`pixel-corners flex items-center gap-3 border-2 p-3 ${
                  got ? "border-yellow/40 bg-yellow/5" : "border-dim/20 bg-black/20 opacity-70"
                }`}
              >
                {got ? (
                  <TrophyPixel size={40} />
                ) : (
                  <span
                    aria-hidden
                    className="font-pixel inline-flex h-10 w-10 items-center justify-center text-[14px] text-dim"
                  >
                    ?
                  </span>
                )}
                <div>
                  <p className={`font-pixel text-[9px] ${got ? "text-white" : "text-dim"}`}>
                    {got ? a.title : "???"}
                  </p>
                  <p className="font-term mt-1 text-base leading-snug text-dim">
                    {got ? a.desc : a.hint}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
