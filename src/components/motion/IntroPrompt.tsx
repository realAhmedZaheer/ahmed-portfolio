"use client";
import { useEffect, useRef, useState } from "react";
import { getStoredMotionPref, setMotionPref, type MotionPref } from "@/lib/motionPref";
import { getStoredSoundPref, setSoundPref, type SoundPref } from "@/lib/soundPref";
import { unlockAudio, playSound } from "@/lib/sfx";
import { unlock } from "@/lib/achievements";

/** First-load boot prompt capturing motion and sound preferences in one gesture. */
export function IntroPrompt() {
  const [show, setShow] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const m = getStoredMotionPref(window.localStorage);
    const s = getStoredSoundPref(window.localStorage);
    if (m === null || s === null) setShow(true);
  }, []);

  if (!show) return null;

  const choose = (motion: MotionPref, sound: SoundPref) => {
    setMotionPref(window.localStorage, motion);
    setSoundPref(window.localStorage, sound);
    if (sound === "on") {
      unlockAudio(); // we are inside the click - audio is now allowed
      playSound("confirm");
      unlock("sound-on");
    }
    setShow(false);
  };

  // Focus trap: Tab cycles the three buttons; Escape picks safe defaults.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      choose("full", "off");
      return;
    }
    if (e.key !== "Tab") return;
    const buttons = dialogRef.current?.querySelectorAll<HTMLElement>("button");
    if (!buttons || buttons.length === 0) return;
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Experience options"
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-[130] flex flex-col items-center justify-center gap-7 bg-[#040208] px-6 text-center"
    >
      <p className="font-pixel text-sm text-cyan [text-shadow:0_0_12px_rgba(34,211,238,.6)] sm:text-base">
        SYSTEM CHECK
      </p>
      <p className="font-term max-w-md text-xl leading-snug text-dim">
        This site runs heavy CRT, glitch and warp animations, with optional
        chiptune sound FX. How do you want to play?
      </p>
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          autoFocus
          onClick={() => choose("full", "on")}
          className="font-pixel gx pixel-corners inline-flex w-72 items-center justify-center gap-3 border-2 border-cyan bg-cyan/10 px-6 py-4 text-[10px] text-cyan [box-shadow:0_0_18px_rgba(34,211,238,.35)] hover:bg-cyan hover:text-bg"
        >
          <span className="blink" aria-hidden>▶</span>
          FULL FX&nbsp;&nbsp;♪ SOUND ON
        </button>
        <button
          type="button"
          onClick={() => choose("full", "off")}
          className="font-pixel gx pixel-corners inline-flex w-72 items-center justify-center gap-3 border-2 border-purple/60 bg-transparent px-6 py-4 text-[10px] text-white hover:border-white"
        >
          FULL FX&nbsp;&nbsp;SOUND OFF
        </button>
        <button
          type="button"
          onClick={() => choose("reduced", "off")}
          className="font-pixel gx pixel-corners inline-flex w-72 items-center justify-center gap-3 border-2 border-dim/50 bg-transparent px-6 py-4 text-[10px] text-dim hover:border-white hover:text-white"
        >
          MINIMAL&nbsp;&nbsp;REDUCED MOTION
        </button>
      </div>
      <p aria-hidden className="font-pixel text-[7px] text-dim">
        CHANGE SOUND ANYTIME WITH THE ♪ TOGGLE · ESC FOR DEFAULTS
      </p>
    </div>
  );
}
