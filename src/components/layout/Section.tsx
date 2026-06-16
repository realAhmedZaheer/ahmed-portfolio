import { cn } from "@/lib/cn";

interface SectionProps {
  id: string;
  num?: string;
  gameName: string;
  srLabel: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Section shell: decorative game-styled header (pixel number badge + glitchy
 * game name) over a visually-hidden real heading so screen readers and the
 * document outline get "Skills", not "STATS · INVENTORY".
 */
export function Section({ id, num, gameName, srLabel, children, className }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn("relative mx-auto w-full max-w-5xl scroll-mt-24 px-5 py-20", className)}
    >
      <h2 id={`${id}-heading`} className="sr-only">
        {srLabel}
      </h2>
      <div aria-hidden className="mb-10 flex items-center gap-4">
        {num && (
          <span className="font-pixel bg-yellow px-2 py-1.5 text-[10px] text-[#1a1030]">
            {num}
          </span>
        )}
        <span
          className="glitch font-pixel text-sm text-cyan [text-shadow:0_0_12px_rgba(34,211,238,.5)] sm:text-base"
          data-text={gameName}
        >
          {gameName}
        </span>
        <span className="h-0 flex-1 border-t-2 border-dashed border-purple/30" />
      </div>
      {children}
    </section>
  );
}
