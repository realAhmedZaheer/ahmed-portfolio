"use client";

interface RunOverProps {
  kind: "over" | "won";
  score: number;
  level: number;
  lines: number;
  bits: number;
  isHighScore: boolean;
  onPrimary(): void;
  onExit(): void;
  onShop?(): void;
}

/** SYSTEM FAILURE (loss) / SECTOR CLEARED (win) panel. (creative-direction §7) */
export function RunOverScreen({ kind, score, level, lines, bits, isHighScore, onPrimary, onExit, onShop }: RunOverProps) {
  const won = kind === "won";
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={won ? "Sector cleared" : "System failure"}
      className="absolute inset-0 z-40 flex items-center justify-center bg-bg/92 px-6"
    >
      <div
        className={`pixel-corners w-full max-w-sm border-2 p-6 text-center ${
          won ? "border-cyan/60" : "border-pink/60"
        }`}
      >
        <p className={`font-pixel text-sm ${won ? "text-cyan" : "text-pink"}`}>
          {won ? "SECTOR CLEARED" : "SYSTEM FAILURE"}
        </p>
        {won && <p className="font-pixel mt-2 text-[8px] text-term">&gt; FIREWALL BREACHED</p>}

        <dl className="font-pixel mt-6 space-y-2 text-left text-[9px]">
          <div className="flex justify-between"><dt className="text-dim">THR:</dt><dd className="text-yellow">{score.toLocaleString()}</dd></div>
          <div className="flex justify-between"><dt className="text-dim">SEC:</dt><dd className="text-white">{level}</dd></div>
          <div className="flex justify-between"><dt className="text-dim">DEF:</dt><dd className="text-white">{lines}</dd></div>
          <div className="flex justify-between"><dt className="text-dim">BITS EARNED:</dt><dd className="text-cyan">{bits}{isHighScore ? " ★" : ""}</dd></div>
        </dl>

        {isHighScore && <p className="font-pixel mt-4 text-[8px] text-yellow [text-shadow:0_0_8px_rgba(253,224,71,.5)]">★ NEW HIGH SCORE</p>}

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onPrimary}
            className="font-pixel gx pixel-corners border-2 border-cyan bg-cyan/10 px-5 py-3 text-[9px] text-cyan hover:bg-cyan hover:text-bg"
          >
            ▶ {won ? "CONTINUE" : "RETRY"}
          </button>
          {onShop && (
            <button
              type="button"
              onClick={onShop}
              className="font-pixel gx pixel-corners border-2 border-term/50 px-5 py-3 text-[9px] text-term hover:bg-term hover:text-bg"
            >
              ▶ UPGRADES · {bits} ⛁
            </button>
          )}
          <button
            type="button"
            onClick={onExit}
            className="font-pixel gx text-[8px] text-dim hover:text-white"
          >
            EXIT TO HUB
          </button>
        </div>
      </div>
    </div>
  );
}
