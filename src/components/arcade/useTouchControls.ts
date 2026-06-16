"use client";
import { useEffect } from "react";
import type { RefObject } from "react";
import type { Action } from "@/lib/defrag/types";
import { COLS } from "@/lib/defrag/types";
import { columnsForDelta, classifyRelease } from "./touchGestures";

interface Opts {
  enabled: boolean;
  surfaceRef: RefObject<HTMLElement | null>;
  playfieldRef: RefObject<HTMLElement | null>;
  dispatch(a: Action): void;
}

/**
 * Touch play for DEFRAG: horizontal drag moves the piece column-by-column while
 * the finger travels; release is a tap (rotate), swipe down (hard drop), or
 * swipe up (hold). Column width is read from the playfield so sensitivity tracks
 * the board size. Powerups stay on buttons above this surface.
 */
export function useTouchControls({ enabled, surfaceRef, playfieldRef, dispatch }: Opts): void {
  useEffect(() => {
    if (!enabled) return;
    const el = surfaceRef.current;
    if (!el) return;

    let active = false;
    let startX = 0, startY = 0, startT = 0, movedCols = 0, pointerId = -1, cellSize = 28;

    const onDown = (e: PointerEvent) => {
      if (active) return;
      active = true;
      pointerId = e.pointerId;
      el.setPointerCapture?.(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      startT = e.timeStamp;
      movedCols = 0;
      const w = playfieldRef.current?.getBoundingClientRect().width ?? 0;
      cellSize = w > 0 ? Math.max(20, w / COLS) : 28;
    };

    const onMove = (e: PointerEvent) => {
      if (!active || e.pointerId !== pointerId) return;
      const want = columnsForDelta(e.clientX - startX, cellSize);
      const dir = want > movedCols ? 1 : -1;
      while (movedCols !== want) {
        dispatch({ type: "MOVE", dir });
        movedCols += dir;
      }
    };

    const finish = (e: PointerEvent) => {
      if (!active || e.pointerId !== pointerId) return;
      active = false;
      el.releasePointerCapture?.(e.pointerId);
      const g = classifyRelease({
        dx: e.clientX - startX,
        dy: e.clientY - startY,
        dt: e.timeStamp - startT,
        movedCols,
      });
      if (g === "tap") dispatch({ type: "ROTATE", dir: 1 });
      else if (g === "swipeDown") dispatch({ type: "HARD_DROP" });
      else if (g === "swipeUp") dispatch({ type: "HOLD" });
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", finish);
    el.addEventListener("pointercancel", finish);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", finish);
      el.removeEventListener("pointercancel", finish);
    };
  }, [enabled, surfaceRef, playfieldRef, dispatch]);
}
