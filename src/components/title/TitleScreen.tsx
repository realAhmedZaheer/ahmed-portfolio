"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GameLogo } from "@/components/title/GameLogo";
import { PixelBurstLoader } from "@/components/title/PixelBurstLoader";
import { TitleBackdrop } from "@/components/title/TitleBackdrop";
import { SoundToggle } from "@/components/hud/SoundToggle";
import { playSound } from "@/lib/sfx";
import { profile } from "@/content/profile";
import { cn } from "@/lib/cn";

/** Menu order mirrors the game progression. */
const MENU = [
  { label: "START", sub: "player select", href: "/player" },
  { label: "STATS", sub: "skill inventory", href: "/stats" },
  { label: "LEVEL SELECT", sub: "agentic LLM · gen-ML work", href: "/work" },
  { label: "SIDE QUEST", sub: "a demo, made to order", href: "/quest" },
  { label: "CAMPAIGN LOG", sub: "experience", href: "/campaign" },
  { label: "CONTINUE?", sub: "contact · resume", href: "/contact" },
];

/* Hard sequential pops - game menus appear frame by frame, they don't slide. */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } },
};
const item = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0 } },
};

/** Loose pixels swarming the name while it materializes (deterministic). */
const FORM_PIXELS = Array.from({ length: 18 }, (_, i) => {
  const hash = ((i + 7) * 2654435761) >>> 0;
  return {
    x: (hash % 460) - 230,
    y: ((hash >> 5) % 110) - 55,
    size: 4 + (hash % 6),
    color: ["#ffffff", "#e8d5ff", "#c084fc", "#22d3ee", "#ec4899"][hash % 5],
    delay: ((hash >> 8) % 5) / 10,
  };
});

interface TitleScreenProps {
  /** Where the home cinematic currently is; the logo behaves accordingly. */
  phase?: "boot" | "warp" | "title";
}

/**
 * The game's title screen. During the warp the logo is FLIP-offset to the
 * exact screen center (above the warp overlay) where it materializes out of
 * pixels; when the warp ends the offset animates to zero so the name "flies
 * up and settles" into its slot, then the menu pops in frame by frame.
 */
export function TitleScreen({ phase = "title" }: TitleScreenProps) {
  const [sel, setSel] = useState(0);
  const [launching, setLaunching] = useState(false);
  const [delta, setDelta] = useState<{ x: number; y: number } | null>(null);
  const deltaRef = useRef<{ x: number; y: number } | null>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const logoWrapRef = useRef<HTMLDivElement>(null);

  // FLIP measure: when the warp starts, offset the logo to the viewport center
  // (where the beams converge). Re-measures on resize, and subtracts the
  // already-applied offset so it stays correct; guards against a 0-size rect
  // (fonts still swapping) by retrying next frame. Runs before paint.
  useLayoutEffect(() => {
    if (phase !== "warp") return;
    let raf = 0;
    const measure = () => {
      const elr = logoWrapRef.current;
      if (!elr) return;
      const r = elr.getBoundingClientRect();
      if (!r.width || !r.height) {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(measure);
        return;
      }
      const applied = deltaRef.current ?? { x: 0, y: 0 };
      const naturalCx = r.left + r.width / 2 - applied.x;
      const naturalCy = r.top + r.height / 2 - applied.y;
      const next = {
        x: window.innerWidth / 2 - naturalCx,
        y: window.innerHeight / 2 - naturalCy,
      };
      deltaRef.current = next;
      setDelta(next);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [phase]);

  const logoStyle: React.CSSProperties =
    phase === "warp" && delta
      ? {
        position: "relative",
        zIndex: 110,
        transform: `translate(${delta.x}px, ${delta.y}px)`,
        transition: "none",
      }
      : {
        transform: "translate(0px, 0px)",
        transition: "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
      };

  useEffect(() => {
    if (phase !== "title") return;
    const t = setTimeout(() => playSound("slam"), 60);
    return () => clearTimeout(t);
  }, [phase]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const dir =
      e.key === "ArrowDown" || e.key === "s" ? 1 :
        e.key === "ArrowUp" || e.key === "w" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (sel + dir + MENU.length) % MENU.length;
    setSel(next);
    linkRefs.current[next]?.focus();
    playSound("move");
  };

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-16">
      {phase === "title" && <TitleBackdrop />}

      <div aria-hidden className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-4 sm:px-8">
        <span className="flicker text-lg tracking-[5px] text-pink [text-shadow:0_0_8px_var(--pink)]">♥ ♥ ♡</span>
        <div className="flex items-center gap-4">
          <span className="font-pixel text-[8px] text-dim">
            1UP&nbsp;&nbsp;<span className="text-yellow">HI-SCORE 999999</span>
          </span>
          <SoundToggle />
        </div>
      </div>

      <div className="w-full max-w-xl text-center">
        <div
          ref={logoWrapRef}
          style={logoStyle}
          className={cn("relative w-full", phase === "warp" && "logo-materialize")}
        >
          <h1 className="w-full leading-tight">
            <GameLogo />
          </h1>
          {phase === "warp" && (
            <span aria-hidden className="form-cluster absolute left-1/2 top-1/2 h-0 w-0">
              {FORM_PIXELS.map((p, i) => (
                <i
                  key={i}
                  className="px-flick absolute block"
                  style={
                    {
                      left: p.x,
                      top: p.y,
                      width: p.size,
                      height: p.size,
                      background: p.color,
                      "--fl-delay": `${p.delay}s`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </span>
          )}
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={phase === "title" ? "show" : "hidden"}
        >
          <motion.p variants={item} className="font-term mt-6 text-2xl text-cyan">
            {profile.tagline}
          </motion.p>
          <motion.p variants={item} className="font-pixel mt-3 text-[8px] leading-relaxed text-dim">
            AI/ML ENGINEER · FULL-STACK · MELBOURNE, AU
          </motion.p>

          <nav aria-label="Main menu" onKeyDown={onKeyDown} className="mx-auto mt-12 max-w-sm text-left">
            <ul className="space-y-1">
              {MENU.map((m, i) => (
                <motion.li variants={item} key={m.href}>
                  <Link
                    href={m.href}
                    ref={(el) => { linkRefs.current[i] = el; }}
                    onMouseEnter={() => { setSel(i); playSound("hover"); }}
                    onFocus={() => setSel(i)}
                    onClick={(e) => {
                      playSound("confirm");
                      if (m.label === "START") {
                        e.preventDefault();
                        setLaunching(true);
                      }
                    }}
                    className={cn(
                      "gx-row group flex items-baseline gap-3 px-3 py-3 outline-none",
                      sel === i ? "bg-purple/15 text-yellow" : "text-white hover:text-yellow",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn("font-pixel w-4 text-[10px] text-cyan", sel === i ? "blink" : "opacity-0")}
                    >
                      ▶
                    </span>
                    <span className="font-pixel text-[11px]">{m.label}</span>
                    <span className="font-term ml-auto text-base text-dim">{m.sub}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>

          <motion.p variants={item} aria-hidden className="font-pixel mt-10 text-[8px] text-dim">
            ↑↓ SELECT&nbsp;&nbsp;·&nbsp;&nbsp;ENTER CONFIRM
          </motion.p>
        </motion.div>
      </div>

      {launching && <PixelBurstLoader target="/player" label="PLAYER SELECT" />}

      <div aria-hidden className="absolute inset-x-0 bottom-0 flex items-center justify-between px-5 py-3 sm:px-8">
        <span className="font-pixel text-[7px] text-dim">v2026.06 - MELBOURNE, AU</span>
        <span suppressHydrationWarning className="font-pixel text-[7px] text-dim">
          © {new Date().getFullYear()} AHMED ZAHEER
        </span>
      </div>
    </main>
  );
}
