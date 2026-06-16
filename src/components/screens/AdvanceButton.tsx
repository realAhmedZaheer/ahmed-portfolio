import Link from "next/link";

interface AdvanceButtonProps {
  href: string;
  label: string;
  next?: string;
}

/** Game-progression CTA: blinking ▶ pixel button that advances to the next screen. */
export function AdvanceButton({ href, label, next }: AdvanceButtonProps) {
  return (
    <div className="mt-14 flex flex-col items-center gap-3">
      <Link
        href={href}
        className="font-pixel gx pixel-corners inline-flex items-center gap-3 border-2 border-cyan bg-cyan/10 px-6 py-4 text-[11px] text-cyan [box-shadow:0_0_18px_rgba(34,211,238,.35)] hover:bg-cyan hover:text-bg"
      >
        <span className="blink" aria-hidden>
          ▶
        </span>
        {label}
      </Link>
      {next && (
        <span aria-hidden className="font-pixel text-[7px] text-dim">
          NEXT: {next}
        </span>
      )}
    </div>
  );
}
