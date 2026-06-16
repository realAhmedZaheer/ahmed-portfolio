"use client";
import { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { getStoredMotionPref, MOTION_EVENT, type MotionPref } from "@/lib/motionPref";

/** App-wide Framer Motion config driven by the user's motion preference. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPref] = useState<MotionPref | null>(null);

  useEffect(() => {
    const update = () => setPref(getStoredMotionPref(window.localStorage));
    update();
    window.addEventListener(MOTION_EVENT, update);
    return () => window.removeEventListener(MOTION_EVENT, update);
  }, []);

  const reducedMotion = pref === "full" ? "never" : pref === "reduced" ? "always" : "user";
  return <MotionConfig reducedMotion={reducedMotion}>{children}</MotionConfig>;
}
