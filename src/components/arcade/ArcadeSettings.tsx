"use client";
import { setSoundPref } from "@/lib/soundPref";
import { useSoundEnabled } from "@/lib/useSoundEnabled";
import { setMotionPref } from "@/lib/motionPref";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { unlockAudio, playSound } from "@/lib/sfx";

const CONTROLS: [string, string][] = [
  ["MOVE", "A / D · ← →"],
  ["SOFT DROP", "S · ↓"],
  ["ROTATE", "W / ↑ · Z / Q"],
  ["HARD DROP", "SPACE"],
  ["HOLD", "SHIFT / C"],
  ["POWERUPS", "1 · 2 · 3"],
  ["PAUSE", "ESC / P"],
];

/** Per-machine settings, surfaced on the cabinet screen: sound, motion, controls.
    Reuses the site's existing preference libs - no new persistence. */
export function ArcadeSettings() {
  const sound = useSoundEnabled();
  const reduced = useReducedMotion();

  const toggleSound = () => {
    const next = sound ? "off" : "on";
    setSoundPref(window.localStorage, next);
    if (next === "on") { unlockAudio(); playSound("confirm"); }
  };
  const toggleMotion = () => {
    setMotionPref(window.localStorage, reduced ? "full" : "reduced");
    playSound("move");
  };

  const row = "flex items-center justify-between gap-4";
  const val = "font-pixel gx text-[9px]";

  return (
    <section className="px-5 py-8 font-term text-term">
      <p className="font-pixel text-sm text-term [text-shadow:0_0_10px_rgba(124,255,178,.5)]">&gt; SETTINGS</p>

      <div className="mt-6 space-y-3">
        <div className={row}>
          <span className="font-pixel text-[9px] text-dim">SOUND</span>
          <button type="button" onClick={toggleSound} aria-pressed={sound} className={`${val} ${sound ? "text-cyan hover:text-white" : "text-dim hover:text-white"}`}>
            ♪ {sound ? "ON" : "OFF"}
          </button>
        </div>
        <div className={row}>
          <span className="font-pixel text-[9px] text-dim">MOTION</span>
          <button type="button" onClick={toggleMotion} aria-pressed={!reduced} className={`${val} ${reduced ? "text-dim hover:text-white" : "text-cyan hover:text-white"}`}>
            {reduced ? "REDUCED" : "FULL FX"}
          </button>
        </div>
      </div>

      <p className="font-pixel mt-8 text-[9px] text-yellow">&gt; CONTROLS</p>
      <dl className="mt-3 space-y-1.5 text-base">
        {CONTROLS.map(([k, v]) => (
          <div key={k} className={row}>
            <dt className="text-dim">{k}</dt>
            <dd className="text-white">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
