"use client";
import type { BossState } from "@/lib/defrag/types";
import { Sigil } from "./Sigil";

/** GATEKEEPER.SYS presence: name, a cracking HP bar, the degrading padlock
    sigil, and the current voice-line flash. (creative-direction §2/§6) */
export function BossBanner({ boss, voice }: { boss: BossState; voice: string | null }) {
  const pct = Math.round((boss.hp / boss.maxHp) * 100);
  const segments = 12;
  const filled = Math.round((boss.hp / boss.maxHp) * segments);

  return (
    <div className="font-pixel w-full text-[8px]">
      <div className="flex items-center gap-3">
        <Sigil hpFraction={boss.hp / boss.maxHp} size={44} />
        <div className="flex-1">
          <p className="text-pink">
            FW: {boss.name} <span className="text-dim">{pct}%</span>
          </p>
          <div className="mt-1 flex gap-px" aria-hidden>
            {Array.from({ length: segments }, (_, i) => (
              <span
                key={i}
                className="h-2 flex-1"
                style={{
                  background: i < filled ? "var(--pink)" : "transparent",
                  border: "1px solid rgba(236,72,153,.35)",
                  // a crack: dim the segment right at the depletion boundary
                  opacity: i === filled - 1 ? 0.6 : 1,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      {voice && (
        <p className="blink mt-2 text-pink/90">{voice}</p>
      )}
    </div>
  );
}
