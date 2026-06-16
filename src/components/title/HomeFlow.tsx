"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { TitleScreen } from "@/components/title/TitleScreen";
import { markBootPlayedThisLoad, markBootSeen, shouldPlayBoot } from "@/lib/boot";
import { getStoredMotionPref, isReducedMotion, MOTION_EVENT } from "@/lib/motionPref";
import { getStoredSoundPref, SOUND_EVENT } from "@/lib/soundPref";

// Code-split the warp generator out of the home bundle - it's a client-only
// overlay; the title screen below carries the SSR/SEO content.
const WarpLoading = dynamic(
  () => import("@/components/title/WarpLoading").then((m) => m.WarpLoading),
  { ssr: false },
);

type Phase = "gate" | "warp" | "title";

/**
 * Home cinematic: the warp + name reveal on first visit, then the title. The
 * green CRT boot is retired; this gate keeps the boot's conditions - first
 * visit only, once per page load, skipped under reduced motion, and held until
 * the intro options prompt is answered so it never plays behind the dialog.
 * TitleScreen stays mounted underneath throughout (SEO + no flash).
 */
export function HomeFlow() {
  const [phase, setPhase] = useState<Phase>("gate");

  useEffect(() => {
    let started = false;
    const decide = () => {
      if (started) return;
      started = true;
      // Read the decision before marking seen (markBootSeen flips the flag
      // shouldPlayBoot checks).
      const play = shouldPlayBoot(window.localStorage) && !isReducedMotion();
      markBootSeen(window.localStorage);
      if (!play) {
        setPhase("title");
        return;
      }
      markBootPlayedThisLoad();
      setPhase("warp");
    };

    const ls = window.localStorage;
    let motionAnswered = getStoredMotionPref(ls) !== null;
    let soundAnswered = getStoredSoundPref(ls) !== null;
    const onMotion = () => { motionAnswered = true; maybeDecide(); };
    const onSound = () => { soundAnswered = true; maybeDecide(); };
    function maybeDecide() {
      if (!motionAnswered || !soundAnswered) return;
      window.removeEventListener(MOTION_EVENT, onMotion);
      window.removeEventListener(SOUND_EVENT, onSound);
      decide();
    }

    if (motionAnswered && soundAnswered) {
      decide();
      return;
    }
    window.addEventListener(MOTION_EVENT, onMotion);
    window.addEventListener(SOUND_EVENT, onSound);
    return () => {
      window.removeEventListener(MOTION_EVENT, onMotion);
      window.removeEventListener(SOUND_EVENT, onSound);
    };
  }, []);

  return (
    <>
      {phase !== "title" && <div aria-hidden className="fixed inset-0 z-[99] bg-[#070310]" />}
      {phase === "warp" && <WarpLoading onComplete={() => setPhase("title")} />}
      <TitleScreen phase={phase === "gate" ? "boot" : phase} />
    </>
  );
}
