"use client";
import { setSoundPref } from "@/lib/soundPref";
import { useSoundEnabled } from "@/lib/useSoundEnabled";
import { unlockAudio, playSound } from "@/lib/sfx";
import { unlock } from "@/lib/achievements";
import { cn } from "@/lib/cn";

/** HUD speaker toggle: flips chiptune SFX on/off and persists the choice. */
export function SoundToggle({ className }: { className?: string }) {
  const on = useSoundEnabled();

  const toggle = () => {
    const next = on ? "off" : "on";
    setSoundPref(window.localStorage, next);
    if (next === "on") {
      unlockAudio(); // inside the click gesture
      playSound("confirm");
      unlock("sound-on");
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Mute sound effects" : "Enable sound effects"}
      className={cn(
        "font-pixel gx inline-block text-[8px]",
        on ? "text-cyan hover:text-white" : "text-dim hover:text-white",
        className,
      )}
    >
      ♪ {on ? "SND ON" : "SND OFF"}
    </button>
  );
}
