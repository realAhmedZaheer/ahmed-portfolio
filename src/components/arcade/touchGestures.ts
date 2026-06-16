/** touch-gesture for DEFRAG. */

export interface GestureConfig {
  /** Max travel (px) for a press to count as a tap. */
  tapMaxDist: number;
  /** Max duration (ms) for a tap. */
  tapMaxMs: number;
  /** Min vertical travel (px) for a swipe. */
  swipeMinDist: number;
  /** Vertical must exceed horizontal by this factor to be a swipe (not a drag). */
  swipeRatio: number;
}

export const DEFAULT_GESTURE_CONFIG: GestureConfig = {
  tapMaxDist: 14,
  tapMaxMs: 300,
  swipeMinDist: 45,
  swipeRatio: 1.3,
};

/** Signed column offset for a horizontal drag of `dx` px at `cellSize` px/column. */
export function columnsForDelta(dx: number, cellSize: number): number {
  if (cellSize <= 0) return 0;
  return Math.trunc(dx / cellSize);
}

export type ReleaseGesture = "tap" | "swipeDown" | "swipeUp" | "none";

/** Classify a finished press from its net vector, duration, and columns already moved. */
export function classifyRelease(
  arg: { dx: number; dy: number; dt: number; movedCols: number },
  cfg: GestureConfig = DEFAULT_GESTURE_CONFIG,
): ReleaseGesture {
  const { dx, dy, dt, movedCols } = arg;
  const dist = Math.hypot(dx, dy);
  if (movedCols === 0 && dist <= cfg.tapMaxDist && dt <= cfg.tapMaxMs) return "tap";
  if (Math.abs(dy) >= cfg.swipeMinDist && Math.abs(dy) >= cfg.swipeRatio * Math.abs(dx)) {
    return dy > 0 ? "swipeDown" : "swipeUp";
  }
  return "none";
}
