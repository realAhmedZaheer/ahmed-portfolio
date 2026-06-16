import { cn } from "@/lib/cn";

/** Shared arena box styling (games add their accent border + background). */
export const forgeArenaClass =
  "pixel-corners relative h-80 touch-none select-none overflow-hidden border-2";

export const FORGE_COLORS = ["var(--cyan)", "var(--pink)", "var(--yellow)", "#c084fc"];

export function CompilingOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#070310]/85">
      <span className="blink font-pixel text-sm text-term [text-shadow:0_0_12px_rgba(124,255,178,.6)]">
        COMPILING ...
      </span>
    </div>
  );
}

interface ForgeChromeProps {
  title: string;
  parts: string[];
  got: number;
  onSkip: () => void;
  controlsHint?: string;
  children: React.ReactNode;
}

/** Header (title + SKIP), the arena slot, controls hint, and the BUILD meter. */
export function ForgeChrome({ title, parts, got, onSkip, controlsHint, children }: ForgeChromeProps) {
  return (
    <div data-testid="forge">
      <div className="font-pixel mb-3 flex items-center justify-between text-[9px]">
        <span className="text-cyan">▶ {title}</span>
        <button
          type="button"
          onClick={onSkip}
          className="gx border border-dim/60 px-2 py-1 text-[8px] text-dim hover:border-white hover:text-white"
        >
          SKIP ▶
        </button>
      </div>

      {children}

      {controlsHint && (
        <p aria-hidden className="font-pixel mt-2 text-center text-[7px] text-dim">
          {controlsHint}
        </p>
      )}

      <div className="mt-2 flex items-center gap-3">
        <span className="font-pixel text-[8px] text-dim">BUILD</span>
        <span aria-hidden className="flex flex-1 gap-1">
          {parts.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-3 flex-1 border border-purple/40",
                i < got ? "bg-cyan [box-shadow:0_0_6px_rgba(34,211,238,.6)]" : "bg-black/40",
              )}
            />
          ))}
        </span>
        <span className="font-pixel text-[8px] text-cyan" aria-live="polite">
          {got}/{parts.length}
        </span>
      </div>
    </div>
  );
}
