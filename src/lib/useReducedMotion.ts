"use client";
import { useEffect, useState } from "react";
import { isReducedMotion, MOTION_EVENT } from "@/lib/motionPref";

/** Reactive reduced-motion state; updates on user choice or OS preference change. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const update = () => setReduced(isReducedMotion());
    update();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", update);
    window.addEventListener(MOTION_EVENT, update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener(MOTION_EVENT, update);
    };
  }, []);
  return reduced;
}
