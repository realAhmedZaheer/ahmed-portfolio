"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { markBootPlayedThisLoad, markBootSeen, shouldPlayBoot } from "@/lib/boot";
import { getStoredMotionPref, isReducedMotion, MOTION_EVENT } from "@/lib/motionPref";
import { getStoredSoundPref, SOUND_EVENT } from "@/lib/soundPref";
import { playSound } from "@/lib/sfx";

const LINES = [
  "> initializing AHMED.exe ...",
  "> breaching DESIGNGURUS.sys ... access granted",
  "> mounting /agentic-llm ... 30+ tools online",
  "> mounting /generative-ml ... gpu workers warm",
  "> loading skill tree ... 99%",
];

interface BootSequenceProps {
  /** `played` is true when the boot animation actually ran (vs. skipped instantly). */
  onComplete?: (played: boolean) => void;
}

/**
 * One-time CRT boot: terminal breach lines typed by a GSAP timeline, then a
 * power-on flash that wipes into the page. Plays on first visit only
 * (localStorage), always skippable, and skipped entirely under reduced motion.
 */
export function BootSequence({ onComplete }: BootSequenceProps) {
  const [active, setActive] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const doneRef = useRef(false);
  const startedRef = useRef(false);
  const finishRef = useRef<() => void>(() => { });
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const start = () => {
      // Guard against React Strict Mode's double effect-invoke.
      if (startedRef.current) return;
      startedRef.current = true;
      if (!shouldPlayBoot(window.localStorage) || isReducedMotion()) {
        markBootSeen(window.localStorage);
        onCompleteRef.current?.(false);
        return;
      }
      // From here on, this page load has had its boot - in-app navigation
      // back to the home screen must not replay it.
      markBootPlayedThisLoad();
      setActive(true);
    };

    // Hold the boot until the intro options prompt is answered (both motion
    // AND sound), so the cinematic never plays hidden behind the dialog.
    // Track answers via the pref EVENTS, not by re-reading localStorage - a
    // failed/blocked storage write (Safari private mode, locked-down browsers)
    // must not deadlock the home screen behind the curtain forever.
    const ls = window.localStorage;
    let motionAnswered = getStoredMotionPref(ls) !== null;
    let soundAnswered = getStoredSoundPref(ls) !== null;

    const onMotion = () => { motionAnswered = true; maybeStart(); };
    const onSound = () => { soundAnswered = true; maybeStart(); };
    function maybeStart() {
      if (!motionAnswered || !soundAnswered) return;
      window.removeEventListener(MOTION_EVENT, onMotion);
      window.removeEventListener(SOUND_EVENT, onSound);
      start();
    }

    if (motionAnswered && soundAnswered) {
      start();
      return;
    }
    window.addEventListener(MOTION_EVENT, onMotion);
    window.addEventListener(SOUND_EVENT, onSound);
    return () => {
      window.removeEventListener(MOTION_EVENT, onMotion);
      window.removeEventListener(SOUND_EVENT, onSound);
    };
  }, []);

  useEffect(() => {
    if (!active || !linesRef.current) return;

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      tlRef.current?.kill();
      markBootSeen(window.localStorage);
      setActive(false);
      onCompleteRef.current?.(true);
    };
    finishRef.current = finish;

    const lineEls = Array.from(
      linesRef.current.querySelectorAll<HTMLElement>("[data-line]"),
    );
    const tl = gsap.timeline({ onComplete: finish });
    tlRef.current = tl;

    lineEls.forEach((el, i) => {
      const full = LINES[i];
      const proxy = { n: 0 };
      let lastBeep = -1;
      tl.set(el, { opacity: 1 }, "+=0.04");
      tl.to(proxy, {
        n: full.length,
        duration: Math.min(0.6, full.length * 0.014),
        ease: "none",
        onUpdate: () => {
          const count = Math.round(proxy.n);
          el.textContent = full.slice(0, count);
          if (count !== lastBeep && count % 3 === 0) {
            lastBeep = count;
            playSound("bootKey");
          }
        },
      });
    });

    tl.to(flashRef.current, { opacity: 0.3, duration: 0.09, delay: 0.18 });
    tl.to(rootRef.current, { scaleY: 0.004, duration: 0.22, ease: "power3.in" });
    tl.to(rootRef.current, { opacity: 0, duration: 0.12 });

    return () => {
      tl.kill();
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={rootRef}
      role="status"
      aria-label="Intro animation"
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-[#04100a] p-6 sm:p-10"
    >
      <div className="flex items-center gap-2" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        <span className="font-term ml-3 text-lg text-term">tty0 - secure shell</span>
      </div>

      <div ref={linesRef} aria-hidden className="font-term text-xl leading-relaxed text-term sm:text-2xl">
        {LINES.map((l) => (
          <div key={l} data-line className="min-h-[1.6em] opacity-0" />
        ))}
        <span className="blink inline-block h-[1.1em] w-[0.55em] translate-y-1 bg-term" />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => finishRef.current()}
          className="font-pixel gx border-2 border-term/60 px-3 py-2 text-[9px] text-term hover:bg-term hover:text-[#04100a]"
        >
          SKIP ▶
        </button>
      </div>

      <div ref={flashRef} aria-hidden className="pointer-events-none absolute inset-0 bg-[#9fe8ff] opacity-0" />
    </div>
  );
}
