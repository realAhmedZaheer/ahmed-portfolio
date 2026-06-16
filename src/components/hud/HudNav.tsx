"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { SoundToggle } from "@/components/hud/SoundToggle";
import { AchievementCounter } from "@/components/achievements/AchievementCounter";
import { playSound } from "@/lib/sfx";

/** Tab order mirrors the game progression. */
const SCREENS = [
  { href: "/player", label: "PLAYER" },
  { href: "/stats", label: "STATS" },
  { href: "/work", label: "WORK" },
  { href: "/quest", label: "QUEST" },
  { href: "/arcade", label: "ARCADE" },
  { href: "/campaign", label: "LOG" },
  { href: "/contact", label: "CONTACT" },
];

/** Persistent game HUD with route tabs, LV/score counter, and scroll-driven XP bar. */
export function HudNav() {
  const pathname = usePathname() ?? "";
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  const lv = reduced ? 999 : Math.max(1, Math.round(progress * 999));
  const score = reduced ? 999999 : Math.round(progress * 999999);

  return (
    <nav
      aria-label="Game screens"
      className="group fixed inset-x-0 top-0 z-[95] border-b-2 border-purple/40 bg-bg2/95"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
        <Link
          href="/"
          onClick={() => playSound("back")}
          className="font-pixel gx inline-block text-[10px] text-cyan"
          aria-label="Back to title screen"
        >
          AZ<span className="text-pink">▮</span>
        </Link>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:gap-x-5">
          {SCREENS.map((s) => {
            const active = pathname === s.href;
            return (
              <Link
                key={s.href}
                href={s.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "font-pixel gx inline-block text-[8px] sm:text-[9px]",
                  active ? "text-yellow" : "text-dim hover:text-white",
                )}
              >
                {active && <span aria-hidden>▶&nbsp;</span>}
                {s.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <span className="font-pixel hidden text-[8px] text-yellow sm:inline" aria-hidden>
            LV.{lv}&nbsp;·&nbsp;{String(score).padStart(6, "0")}
          </span>
          <AchievementCounter />
          <SoundToggle />
        </div>
      </div>
      <div aria-hidden className="h-0.5 bg-purple/20 transition-[height] duration-150 group-hover:h-1.5">
        <div
          className="h-full bg-gradient-to-r from-cyan via-purple to-pink"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </nav>
  );
}
