"use client";
import { useEffect } from "react";
import { isSoundOn } from "@/lib/soundPref";
import { unlockAudio } from "@/lib/sfx";

/** Unlocks AudioContext on first gesture for returning visitors (browser policy requires it). */
export function SoundProvider() {
  useEffect(() => {
    const unlock = () => {
      if (isSoundOn()) unlockAudio();
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);
  return null;
}
