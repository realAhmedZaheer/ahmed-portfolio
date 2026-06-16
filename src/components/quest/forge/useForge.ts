"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { playSound } from "@/lib/sfx";

/** Shared forge logic: tracks collected parts, auto-assists stragglers, hands over on completion. */
export function useForge(count: number, onComplete: () => void) {
  const [collected, setCollected] = useState<boolean[]>(() => Array(count).fill(false));
  const [compiling, setCompiling] = useState(false);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const collect = useCallback((i: number) => {
    setCollected((prev) => {
      if (prev[i]) return prev;
      playSound("move");
      const next = [...prev];
      next[i] = true;
      return next;
    });
  }, []);

  const skip = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onCompleteRef.current();
  }, []);

  const got = collected.filter(Boolean).length;
  const allCollected = got === count;

  useEffect(() => {
    let iv: ReturnType<typeof setInterval> | undefined;
    const t = setTimeout(() => {
      iv = setInterval(() => {
        setCollected((prev) => {
          const i = prev.findIndex((c) => !c);
          if (i === -1) {
            if (iv) clearInterval(iv);
            return prev;
          }
          playSound("hover");
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 380);
    }, count * 650 + 4500);
    return () => {
      clearTimeout(t);
      if (iv) clearInterval(iv);
    };
  }, [count]);

  useEffect(() => {
    if (!allCollected || doneRef.current) return;
    setCompiling(true);
    playSound("confirm");
    const t = setTimeout(() => {
      if (doneRef.current) return;
      doneRef.current = true;
      onCompleteRef.current();
    }, 1100);
    return () => clearTimeout(t);
  }, [allCollected]);

  return { collected, collect, got, allCollected, compiling, skip };
}
