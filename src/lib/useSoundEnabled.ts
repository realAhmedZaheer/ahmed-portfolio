"use client";
import { useEffect, useState } from "react";
import { isSoundOn, SOUND_EVENT } from "@/lib/soundPref";

/** Reactive sound on/off, for the HUD toggle. */
export function useSoundEnabled(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const update = () => setOn(isSoundOn());
    update();
    window.addEventListener(SOUND_EVENT, update);
    return () => window.removeEventListener(SOUND_EVENT, update);
  }, []);
  return on;
}
