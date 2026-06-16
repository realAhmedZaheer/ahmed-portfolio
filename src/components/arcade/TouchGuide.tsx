"use client";
import { useEffect, useState } from "react";

const SEEN_KEY = "az_defrag_touch_guide_v1";

const HINTS = [
  { icon: "⇆", label: "DRAG to move" },
  { icon: "◉", label: "TAP to rotate" },
  { icon: "↓", label: "SWIPE DOWN to drop" },
  { icon: "↑", label: "SWIPE UP to hold" },
];

/** One-time touch-controls guide: shown on the first mobile run, dismissed on tap or after a few seconds. */
export function TouchGuide() {
  const [show, setShow] = useState(false);

  function hide() {
    setShow(false);
    try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* storage blocked */ }
  }

  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(SEEN_KEY) === "1"; } catch { /* storage blocked */ }
    if (seen) return;
    setShow(true);
    const id = window.setTimeout(() => hide(), 3500);
    return () => window.clearTimeout(id);
  }, []);

  if (!show) return null;
  return (
    <div
      onPointerDown={(e) => { e.stopPropagation(); hide(); }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 px-6"
    >
      <div className="pixel-corners border-2 border-cyan/50 bg-bg2/95 px-6 py-5">
        <p className="font-pixel mb-4 text-center text-[9px] text-cyan">TOUCH CONTROLS</p>
        <ul className="font-pixel space-y-3 text-[8px] text-white">
          {HINTS.map((h) => (
            <li key={h.label} className="flex items-center gap-3">
              <span aria-hidden className="w-5 text-center text-[12px] text-yellow">{h.icon}</span>
              <span>{h.label}</span>
            </li>
          ))}
        </ul>
        <p className="font-pixel mt-4 text-center text-[7px] text-dim">TAP TO BEGIN</p>
      </div>
    </div>
  );
}
