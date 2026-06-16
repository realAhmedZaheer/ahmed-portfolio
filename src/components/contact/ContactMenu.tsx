"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { GlitchText } from "@/components/fx/GlitchText";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { contact } from "@/content/contact";
import { ACHIEVEMENTS, ACH_VISIT_KEY, getUnlocked, MAIN_SCREENS } from "@/lib/achievements";
import { isReducedMotion } from "@/lib/motionPref";

const TAGLINE = "insert coin - or just reach out";

/** Count how many MAIN_SCREENS appear in the visited-paths localStorage array. */
function readVisitedCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(ACH_VISIT_KEY);
    if (!raw) return 0;
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return 0;
    const seen = new Set(arr.map(String));
    return MAIN_SCREENS.filter((p) => seen.has(p)).length;
  } catch {
    return 0;
  }
}

export function ContactMenu() {
  const links = contact.filter((c) => !c.hidden);

  // Auto-type the tagline, leaving the blinking cursor at the end.
  // Reduced motion shows the full text immediately.
  const [typed, setTyped] = useState(TAGLINE);

  useEffect(() => {
    if (isReducedMotion()) {
      setTyped(TAGLINE);
      return;
    }
    setTyped("");
    let i = 0;
    const step = Math.max(20, Math.round(1000 / TAGLINE.length)); // ~1s total
    const id = window.setInterval(() => {
      i += 1;
      setTyped(TAGLINE.slice(0, i));
      if (i >= TAGLINE.length) window.clearInterval(id);
    }, step);
    return () => window.clearInterval(id);
  }, []);

  // Task 3 - FINAL SCORE summary, read client-side after mount.
  const [score, setScore] = useState<{ visited: number; unlocked: number } | null>(null);
  useEffect(() => {
    setScore({ visited: readVisitedCount(), unlocked: getUnlocked().size });
  }, []);

  return (
    <div className="mx-auto max-w-xl text-center">
      <GlitchText text="CONTINUE?" as="p" className="text-xl text-white sm:text-3xl" />
      <p className="font-term mt-3 text-2xl text-cyan">
        {typed}
        <span className="blink" aria-hidden>▮</span>
      </p>

      {/* Task 3 - dim pixel scoreboard tallying real progress. */}
      <p
        className="font-pixel mt-6 min-h-[1.2em] text-[8px] leading-relaxed text-dim"
        aria-live="polite"
      >
        {score
          ? `SCREENS VISITED: ${score.visited}/${MAIN_SCREENS.length} · ACHIEVEMENTS: ${score.unlocked}/${ACHIEVEMENTS.length} · STATUS: IMPRESSED?`
          : " "}
      </p>

      {/* Task 1 - link rows reveal sequentially, each one an option being offered. */}
      <RevealGroup>
        <ul className="mt-8 border-t-2 border-purple/30">
          {links.map((c) => {
            const external = c.href.startsWith("http");
            return (
              <RevealItem key={c.label}>
                <li className="group border-b-2 border-purple/30">
                  <a
                    href={c.href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="gx-row flex items-center justify-between px-4 py-5 hover:bg-purple/10"
                  >
                    <span className="font-pixel text-[10px] text-white group-hover:text-yellow">
                      <span
                        aria-hidden
                        className="mr-3 inline-block opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        ▶
                      </span>
                      {c.label.toUpperCase()}
                    </span>
                    <span aria-hidden className="font-pixel text-[9px] text-dim group-hover:text-cyan">
                      {c.prompt}
                    </span>
                  </a>
                </li>
              </RevealItem>
            );
          })}
        </ul>
      </RevealGroup>

      <p className="font-term mt-8 text-lg text-dim">
        Melbourne, AU · open to AI/ML + full-stack roles
      </p>

      {/* Task 4 - prominent post-credits side-quest banner with a pulsing border. */}
      <Link
        href="/quest"
        className="gx group/banner sq-pulse mt-6 flex w-full items-center justify-center border-2 border-yellow/60 px-4 py-4 text-yellow transition-colors hover:bg-yellow hover:text-bg"
      >
        <span className="font-pixel text-[10px] leading-relaxed">
          ★ NOT DONE YET? FORGE A CUSTOM DEMO{" "}
          <span aria-hidden className="ml-1 inline-block group-hover/banner:translate-x-0.5">
            ▶
          </span>
        </span>
      </Link>

      {/* Self-contained pulse (no globals.css edits). Reduced motion is killed
          globally via html[data-motion="reduced"]; the @media query covers the
          OS-level preference when the user hasn't made an explicit choice. */}
      <style>{`
        .sq-pulse { animation: sq-pulse 1.8s ease-in-out infinite; }
        @keyframes sq-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(253, 224, 71, 0);
            border-color: rgba(253, 224, 71, 0.6);
          }
          50% {
            box-shadow: 0 0 14px 2px rgba(253, 224, 71, 0.45);
            border-color: rgba(253, 224, 71, 1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .sq-pulse { animation: none; }
        }
      `}</style>
    </div>
  );
}
