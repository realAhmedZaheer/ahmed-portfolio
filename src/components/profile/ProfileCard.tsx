"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { PixelAvatar } from "@/components/profile/PixelAvatar";
import { RevealGroup, RevealItem, ScrollReveal } from "@/components/motion/Reveal";
import { profile } from "@/content/profile";
import { isReducedMotion } from "@/lib/motionPref";
import { playSound } from "@/lib/sfx";
import { cn } from "@/lib/cn";

/** Teaser skill bars - plausible values, the full breakdown lives on /stats. */
const SKILL_TEASER: { label: string; level: number }[] = [
  { label: "AI/ML", level: 9 },
  { label: "FRONTEND", level: 8 },
  { label: "BACKEND", level: 8 },
  { label: "DEVOPS", level: 7 },
];

/** Renders a 10-cell pixel level-bar like ████████░░ for a given level (0-10). */
function LevelBar({ level }: { level: number }) {
  const filled = Math.max(0, Math.min(10, level));
  return (
    <span aria-hidden className="font-pixel tracking-[1px] text-[9px]">
      <span className="text-cyan [text-shadow:0_0_8px_rgba(34,211,238,.45)]">
        {"█".repeat(filled)}
      </span>
      <span className="text-purple/40">{"░".repeat(10 - filled)}</span>
    </span>
  );
}

export function ProfileCard() {
  const [locking, setLocking] = useState(false);
  const selectRef = useRef<HTMLAnchorElement>(null);
  // Lets the delayed, programmatic re-click pass straight through to <Link>.
  const passthrough = useRef(false);

  // SELECT lock-in: flash the avatar white, chime, show "PLAYER LOCKED IN",
  // then navigate. Under reduced motion we skip the theatrics and go at once.
  // To keep Next's client-side navigation (and avoid a router dependency) we
  // re-fire a real click on the <Link> after the beat, flagged to bypass us.
  const onSelect = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (passthrough.current) {
      passthrough.current = false;
      return; // real navigation click - let <Link> handle it
    }
    if (locking) {
      e.preventDefault();
      return;
    }
    playSound("confirm");
    if (isReducedMotion()) return; // let the <Link> navigate normally now
    e.preventDefault();
    setLocking(true);
    setTimeout(() => {
      passthrough.current = true;
      selectRef.current?.click();
    }, 250);
  };

  return (
    <RevealGroup className="grid items-start gap-8 md:grid-cols-[220px_1fr]">
      {/* player card */}
      <RevealItem className="pixel-corners border-2 border-purple/50 bg-gradient-to-b from-purple/20 to-cyan/5 p-4 text-center">
        <div className="font-pixel mb-3 text-[8px] text-yellow">PLAYER 1</div>

        {/* avatar + lock-in flash overlay (~2-frame white blink, scoped CSS) */}
        <div className="relative mx-auto block h-40 w-40">
          <PixelAvatar className="block h-40 w-40" />
          {locking && (
            <>
              <style>{
                "@keyframes az-select-flash{0%{opacity:0}10%{opacity:.95}40%{opacity:.95}100%{opacity:0}}"
              }</style>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-white"
                style={{ animation: "az-select-flash 220ms steps(2,end) forwards" }}
              />
            </>
          )}
        </div>

        <div className="font-pixel mt-3 text-[8px] text-dim">
          CLASS: <span className="text-cyan">ENGINEER</span>
        </div>

        {/* lock-in confirmation line, reserves space so the card doesn't jump */}
        <div
          aria-live="polite"
          className="font-pixel mt-2 h-[10px] text-[8px] text-yellow [text-shadow:0_0_8px_rgba(253,224,71,.5)]"
        >
          {locking && <span className="blink">&gt; PLAYER LOCKED IN</span>}
        </div>

        <Link
          ref={selectRef}
          href="/stats"
          onClick={onSelect}
          aria-disabled={locking}
          className={cn(
            "font-pixel gx mt-3 block border-2 border-yellow bg-yellow/10 px-3 py-3 text-[9px] text-yellow [box-shadow:0_0_14px_rgba(253,224,71,.3)] hover:bg-yellow hover:text-bg",
            locking && "pointer-events-none opacity-80",
          )}
        >
          <span className="blink" aria-hidden>▶</span> SELECT
        </Link>
      </RevealItem>

      <div>
        <RevealItem>
          <p className="font-pixel text-[10px] leading-relaxed text-cyan [text-shadow:0_0_10px_rgba(34,211,238,.4)]">
            AI/ML ENGINEER × FULL-STACK DEVELOPER
          </p>
          <p className="font-term mt-5 max-w-2xl text-2xl leading-snug text-[#c8bff0]">
            {profile.bioFirstPerson}
          </p>
        </RevealItem>

        {/* stats-preview strip - teaser of the full /stats screen */}
        <RevealItem>
          <div className="pixel-corners mt-6 max-w-md border-2 border-cyan/30 bg-cyan/5 p-3">
            <div className="font-pixel mb-2 text-[8px] text-dim">SKILL PREVIEW</div>
            <dl className="space-y-1.5">
              {SKILL_TEASER.map((s, i) => (
                <ScrollReveal key={s.label} delay={i * 0.06}>
                  <div className="flex items-center gap-3">
                    <dt className="font-pixel w-[64px] shrink-0 text-[8px] text-yellow">
                      {s.label}
                    </dt>
                    <dd className="flex items-center gap-2">
                      <LevelBar level={s.level} />
                      <span className="font-pixel text-[7px] text-dim">{s.level}/10</span>
                    </dd>
                  </div>
                </ScrollReveal>
              ))}
            </dl>
            <Link
              href="/stats"
              onMouseEnter={() => playSound("hover")}
              className="font-pixel gx mt-3 inline-block text-[8px] text-cyan hover:text-yellow"
            >
              <span className="blink" aria-hidden>▶</span> VIEW FULL STATS
            </Link>
          </div>
        </RevealItem>

        <RevealItem>
          <dl className="font-term mt-7 space-y-2 text-xl">
            <div className="flex gap-3">
              <dt aria-hidden className="text-pink">⌖</dt>
              <dt className="sr-only">Location</dt>
              <dd className="text-dim">{profile.location}</dd>
            </div>
            {profile.education.map((e) => (
              <div key={e.title} className="flex gap-3">
                <dt aria-hidden className="text-yellow">✦</dt>
                <dt className="sr-only">Education</dt>
                <dd className="text-dim">
                  {e.title} - {e.org}
                  {e.status && <span className="text-cyan"> ({e.status})</span>}
                </dd>
              </div>
            ))}
          </dl>
        </RevealItem>
      </div>
    </RevealGroup>
  );
}
