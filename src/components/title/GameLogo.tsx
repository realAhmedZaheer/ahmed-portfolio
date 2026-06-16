import { cn } from "@/lib/cn";

interface GameLogoProps {
  className?: string;
}

/**
 * The game-title logo: "AHMED ZAHEER" as a hard-skewed chrome-gradient
 * wordmark with glitch slice layers, sword-like side blades, pixel fragments,
 * and a SUPER ★ 999 MODE badge - styled after a boss-fight splash logo.
 */
export function GameLogo({ className }: GameLogoProps) {
  return (
    <span className={cn("flex w-full flex-col items-center", className)}>
      <span className="font-pixel relative z-10 mb-4 block w-fit bg-white px-3 py-1.5 text-[9px] tracking-wide text-[#1a1030]">
        SUPER ★ 999 MODE
        <span aria-hidden className="absolute -left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 bg-cyan" />
        <span aria-hidden className="absolute -right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 bg-pink" />
      </span>

      <span className="relative block whitespace-nowrap">
        <span aria-hidden className="logo-blade logo-blade--left" />
        <span
          data-text="AHMED ZAHEER"
          className="logo-main font-logo text-[clamp(2.3rem,8.5vw,5.5rem)] uppercase"
        >
          AHMED ZAHEER
        </span>
        <span aria-hidden className="logo-blade logo-blade--right" />

        <span aria-hidden className="absolute -top-3 left-[7%] h-2 w-2 bg-yellow" />
        <span aria-hidden className="absolute -top-1.5 left-[11%] h-1.5 w-1.5 bg-yellow/70" />
        <span aria-hidden className="absolute -bottom-3 right-[9%] h-2 w-2 bg-cyan" />
        <span aria-hidden className="absolute -bottom-1.5 right-[14%] h-1.5 w-1.5 bg-cyan/70" />
        <span aria-hidden className="absolute -right-2 -top-2 h-2 w-4 bg-pink/80" />
        <span aria-hidden className="absolute -left-2 bottom-1 h-2 w-3 bg-purple/80" />
      </span>
    </span>
  );
}
