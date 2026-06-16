"use client";
import { getAudioContext, playTone, playNoise, getMaster } from "@/lib/sfx";
import { isSoundOn } from "@/lib/soundPref";

export type DefragSound =
  | "lock" | "rotate" | "hold" | "clear1" | "clear2" | "clear3"
  | "overflow" | "powerup" | "bosshit" | "bosswarn" | "garbage" | "gameover"
  | "anomaly" | "explode";

/** Play a DEFRAG SFX. No-op when sound is off or audio isn't unlocked. */
export function defragSound(name: DefragSound): void {
  if (!isSoundOn()) return;
  const c = getAudioContext();
  if (!c || c.state !== "running") return;
  const t = c.currentTime;
  switch (name) {
    case "lock":
      playTone(c, { type: "sine", f0: 80, t0: t, dur: 0.06, vol: 0.3 });
      playNoise(c, t, 0.04, 0.12, 800);
      break;
    case "rotate":
      playTone(c, { type: "triangle", f0: 1200, t0: t, dur: 0.02, vol: 0.1 });
      break;
    case "hold":
      playNoise(c, t, 0.08, 0.08, 1400);
      playTone(c, { type: "square", f0: 600, t0: t + 0.04, dur: 0.01, vol: 0.1 });
      break;
    case "clear1":
      playNoise(c, t, 0.1, 0.1, 3000);
      playTone(c, { type: "square", f0: 440, f1: 660, t0: t, dur: 0.12, vol: 0.22 });
      break;
    case "clear2":
      playTone(c, { type: "square", f0: 440, f1: 660, t0: t, dur: 0.14, vol: 0.22 });
      playTone(c, { type: "square", f0: 660, f1: 990, t0: t, dur: 0.14, vol: 0.18 });
      break;
    case "clear3":
      [523, 659, 784].forEach((f) => playTone(c, { type: "square", f0: f, t0: t, dur: 0.15, vol: 0.18 }));
      break;
    case "overflow": {
      playTone(c, { type: "sine", f0: 200, f1: 40, t0: t, dur: 0.3, vol: 0.34 });
      [523, 659, 784, 1047].forEach((f, i) =>
        playTone(c, { type: "square", f0: f, t0: t + i * 0.05, dur: 0.08, vol: 0.24 }));
      playNoise(c, t, 0.2, 0.18, 3000);
      break;
    }
    case "powerup":
      playTone(c, { type: "sawtooth", f0: 200, f1: 1400, t0: t, dur: 0.2, vol: 0.22 });
      playTone(c, { type: "triangle", f0: 1600, t0: t + 0.2, dur: 0.06, vol: 0.12 });
      break;
    case "bosshit":
      playNoise(c, t, 0.06, 0.16, 1200);
      playTone(c, { type: "square", f0: 500, f1: 200, t0: t, dur: 0.1, vol: 0.2 });
      break;
    case "bosswarn":
      [0, 0.2, 0.4, 0.6].forEach((dt, i) =>
        playTone(c, { type: "square", f0: i % 2 ? 260 : 200, t0: t + dt, dur: 0.18, vol: 0.18 }));
      break;
    case "garbage":
      playTone(c, { type: "sine", f0: 60, t0: t, dur: 0.08, vol: 0.3 });
      playNoise(c, t, 0.05, 0.16, 600);
      break;
    case "anomaly":
      // percussive triple-hit - tick-tick-TING, distinct from the clear chord
      [440, 660, 880].forEach((f, i) =>
        playTone(c, { type: "square", f0: f, t0: t + i * 0.07, dur: 0.03, vol: 0.22 }));
      break;
    case "explode": {
      // deep detonation + debris - the SYSTEM FAILURE blast
      playTone(c, { type: "sine", f0: 220, f1: 28, t0: t, dur: 0.55, vol: 0.42 });
      playNoise(c, t, 0.45, 0.34, 2000);
      playNoise(c, t + 0.04, 0.3, 0.22, 600);
      break;
    }
    case "gameover":
      [330, 262, 220, 175].forEach((f, i) =>
        playTone(c, { type: "square", f0: f, t0: t + i * 0.2, dur: 0.18, vol: 0.24 }));
      playNoise(c, t + 0.8, 1.0, 0.06, 1200);
      break;
  }
}

/** Subsonic danger heartbeat - start when the stack is high, stop when safe.
    Phase-1 MusicBed is just this pulse + start/stop/rate hooks. */
export class MusicBed {
  private timer: ReturnType<typeof setInterval> | null = null;

  startHeartbeat(rateHz = 1.2) {
    if (!isSoundOn()) return;
    const c = getAudioContext();
    const master = getMaster();
    if (!c || c.state !== "running" || !master || this.timer) return;
    this.timer = setInterval(() => {
      const t = c.currentTime;
      playTone(c, { type: "sine", f0: 55, t0: t, dur: 0.14, vol: 0.18 });
    }, 1000 / rateHz);
  }

  setRate(rateHz: number) {
    if (this.timer) {
      this.stop();
      this.startHeartbeat(rateHz);
    }
  }

  get running() {
    return this.timer !== null;
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
