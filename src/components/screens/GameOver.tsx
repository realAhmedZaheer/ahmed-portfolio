"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isReducedMotion } from "@/lib/motionPref";
import { playSound } from "@/lib/sfx";
import { unlock, type AchievementId } from "@/lib/achievements";

const WORD = "GAME OVER";

interface GameOverProps {
  /** Where FINISH leads once the transition plays. */
  href?: string;
  /** Shown in the NEXT hint and the loading line. */
  nextLabel?: string;
  /** Unlocked when the player hits FINISH (e.g. the campaign finale). */
  achievementId?: AchievementId;
}

/**
 * The run's finale: a FINISH button triggers a full-screen GAME OVER
 * transition - letters pop in arcade-style, the score tallies, then the next
 * screen loads. Reduced motion navigates immediately.
 */
export function GameOver({
  href = "/contact",
  nextLabel = "CONTINUE?",
  achievementId,
}: GameOverProps = {}) {
  const [active, setActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    if (achievementId) unlock(achievementId);
    playSound("gameover");
    if (isReducedMotion()) {
      router.push(href);
      return;
    }
    const t = setTimeout(() => router.push(href), 2600);
    return () => clearTimeout(t);
  }, [active, router, href, achievementId]);

  return (
    <div className="px-5 py-16 text-center">
      <p className="font-term text-2xl text-dim">ALL LEVELS CLEARED</p>
      <button
        type="button"
        onClick={() => setActive(true)}
        className="font-pixel gx pixel-corners mt-6 inline-flex items-center gap-3 border-2 border-cyan bg-cyan/10 px-6 py-4 text-[11px] text-cyan [box-shadow:0_0_18px_rgba(34,211,238,.35)] hover:bg-cyan hover:text-bg"
      >
        <span className="blink" aria-hidden>▶</span>
        FINISH
      </button>
      <p aria-hidden className="font-pixel mt-3 text-[7px] text-dim">
        NEXT: {nextLabel}
      </p>

      {active && (
        <div
          role="status"
          aria-label={`Game over - loading ${nextLabel}`}
          data-nav-overlay
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-[#040208]"
        >
          {/* letters pop in one frame at a time */}
          <p className="font-pixel text-3xl text-white sm:text-5xl" aria-hidden>
            {WORD.split("").map((ch, i) => (
              <span
                key={i}
                className="pop-in inline-block [text-shadow:3px_0_var(--pink),-3px_0_var(--cyan)]"
                style={{ animationDelay: `${200 + i * 110}ms` }}
              >
                {ch === " " ? " " : ch}
              </span>
            ))}
          </p>

          <div className="pop-in" style={{ animationDelay: "1400ms" }}>
            <p className="font-term text-2xl text-dim">
              ALL BOSSES CLEARED · FINAL SCORE{" "}
              <span className="text-yellow [text-shadow:0_0_8px_rgba(253,224,71,.5)]">999999</span>
            </p>
            <p className="font-term mt-1 text-xl text-dim">
              every system shipped to production · no continues used
            </p>
          </div>

          <p
            className="pop-in blink font-pixel text-[9px] text-cyan"
            style={{ animationDelay: "1900ms" }}
            aria-hidden
          >
            LOADING {nextLabel} ...
          </p>
        </div>
      )}
    </div>
  );
}
