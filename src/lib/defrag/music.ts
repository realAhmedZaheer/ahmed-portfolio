import { getAudioContext, playTone, playNoise } from "@/lib/sfx";
import { isSoundOn } from "@/lib/soundPref";

// --- Scale / tempo ---------------------------------------------------------

const ROOT_HZ = 110; // A2
const SCALE = [0, 3, 5, 7, 10]; // minor pentatonic (semitone offsets)
export const BPM = 110;
export const STEP_DUR = 60 / BPM / 4; // 16th-note seconds
export const STEPS = 16;
const MIX = 1.7; // music level relative to the shared master (bumped - was too quiet)

/** A scale degree (can be negative / past an octave) → frequency in Hz. */
export function noteHz(degree: number): number {
  const n = SCALE.length;
  const oct = Math.floor(degree / n);
  const idx = ((degree % n) + n) % n;
  return ROOT_HZ * Math.pow(2, (SCALE[idx] + oct * 12) / 12);
}

export interface LayerGains { kick: number; bass: number; arp: number; pad: number; }
const ramp = (x: number, lo: number, hi: number) => Math.max(0, Math.min(1, (x - lo) / (hi - lo)));

/** Map a 0..1 intensity to per-stem target gains with staggered thresholds. */
export function layerGains(intensity: number): LayerGains {
  return {
    kick: 0.5 + ramp(intensity, 0, 0.25) * 0.5,
    bass: ramp(intensity, 0.12, 0.32),
    arp: ramp(intensity, 0.45, 0.68),
    pad: ramp(intensity, 0.7, 0.92),
  };
}

/** The next step boundary ≥ now (for quantizing input chords to the grid). */
export function quantizeTime(now: number, startTime: number, stepDur: number): number {
  if (now <= startTime) return startTime;
  // epsilon so a value already on a step boundary returns itself (FP guard)
  return startTime + Math.ceil((now - startTime) / stepDur - 1e-9) * stepDur;
}

// --- The engine ------------------------------------------------------------

export type MusicAction = "move" | "rotate" | "hold" | "lock" | "clear" | "overflow" | "harddrop";

const KICK = [0, 4, 8, 12];
const BASS = [0, 6, 8, 14];
const BASS_DEGREES = [-5, -3, -5, -3];
const ARP = [0, 2, 4, 6, 8, 10, 12, 14];
const ARP_DEGREES = [0, 2, 4, 5, 4, 2, 4, 7];

/**
 * Synesthesia music engine: a lookahead scheduler over a minor-pentatonic scale
 * with adaptive layered stems (kick/bass/arp/pad) and beat-quantized input chords,
 * exposing a beat/kick clock the visuals sync to. Built on the shared `sfx`
 * AudioContext; silent unless the user has sound on, and jsdom-safe (no-ops when
 * there is no AudioContext). (DEFRAG synesthesia - sub-piece A)
 */
class Music {
  private ctx: AudioContext | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private step = 0;
  private nextNoteTime = 0;
  private startTime = 0;
  private intensity = 0.15;
  private target = 0.2;
  private kickAt = -1;

  get running(): boolean { return this.timer !== null; }

  start(): void {
    if (this.timer || !isSoundOn()) return;
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== "running") return;
    this.ctx = ctx;
    this.startTime = this.nextNoteTime = ctx.currentTime + 0.1;
    this.step = 0;
    this.intensity = 0.15;
    this.timer = setInterval(() => this.schedule(), 25);
  }

  stop(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this.ctx = null;
  }

  setIntensityTarget(x: number): void {
    this.target = Math.max(0, Math.min(1, x));
  }

  /** Beat phase (0..1) + a decaying kick spike for visual sync; null when idle. */
  beat(): { phase: number; kick: number } | null {
    const ctx = this.ctx;
    if (!this.timer || !ctx) return null;
    const beatDur = STEP_DUR * 4;
    const phase = ((((ctx.currentTime - this.startTime) % beatDur) + beatDur) % beatDur) / beatDur;
    const kick = this.kickAt < 0 ? 0 : Math.max(0, 1 - (ctx.currentTime - this.kickAt) / 0.15);
    return { phase, kick };
  }

  /** Schedule an in-scale note for a play action, quantized to the next 16th step. */
  trigger(action: MusicAction): void {
    const ctx = this.ctx;
    if (!this.timer || !ctx) return;
    const t = quantizeTime(ctx.currentTime + 0.02, this.startTime, STEP_DUR);
    switch (action) {
      case "move": playTone(ctx, { type: "triangle", f0: noteHz(4), t0: t, dur: 0.06, vol: 0.07 * MIX }); break;
      case "rotate": playTone(ctx, { type: "triangle", f0: noteHz(7), t0: t, dur: 0.12, vol: 0.15 * MIX }); break;
      case "hold": playTone(ctx, { type: "square", f0: noteHz(3), t0: t, dur: 0.1, vol: 0.12 * MIX }); break;
      case "lock": playTone(ctx, { type: "square", f0: noteHz(0), t0: t, dur: 0.12, vol: 0.16 * MIX }); break;
      case "harddrop": playTone(ctx, { type: "square", f0: noteHz(-2), t0: t, dur: 0.16, vol: 0.2 * MIX }); break;
      case "clear":
        playTone(ctx, { type: "square", f0: noteHz(4), t0: t, dur: 0.1, vol: 0.18 * MIX });
        playTone(ctx, { type: "square", f0: noteHz(7), t0: t + STEP_DUR, dur: 0.12, vol: 0.18 * MIX });
        break;
      case "overflow":
        [0, 2, 4].forEach((d, i) =>
          playTone(ctx, { type: "square", f0: noteHz(7 + d), t0: t + (i * STEP_DUR) / 2, dur: 0.14, vol: 0.2 * MIX }));
        break;
    }
  }

  private schedule(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    // stop if muted or context died mid-run
    if (!isSoundOn() || ctx.state !== "running") { this.stop(); return; }
    this.intensity += (this.target - this.intensity) * 0.08;
    const g = layerGains(this.intensity);
    while (this.nextNoteTime < ctx.currentTime + 0.1) {
      const t = this.nextNoteTime;
      const s = this.step;
      if (KICK.includes(s)) {
        playTone(ctx, { type: "sine", f0: 130, f1: 45, t0: t, dur: 0.13, vol: 0.32 * MIX * g.kick });
        playNoise(ctx, t, 0.03, 0.06 * MIX * g.kick, 1500);
        this.kickAt = t;
      }
      if (g.bass > 0.05 && BASS.includes(s)) {
        const d = BASS_DEGREES[BASS.indexOf(s)] ?? -5;
        playTone(ctx, { type: "square", f0: noteHz(d), t0: t, dur: STEP_DUR * 1.6, vol: 0.16 * MIX * g.bass });
      }
      if (g.arp > 0.05 && ARP.includes(s)) {
        const d = ARP_DEGREES[ARP.indexOf(s)] ?? 0;
        playTone(ctx, { type: "triangle", f0: noteHz(5 + d), t0: t, dur: 0.1, vol: 0.1 * MIX * g.arp });
      }
      if (g.pad > 0.05 && s === 0) {
        [0, 2, 4].forEach((d) =>
          playTone(ctx, { type: "sine", f0: noteHz(d), t0: t, dur: STEP_DUR * 14, vol: 0.06 * MIX * g.pad }));
      }
      this.step = (this.step + 1) % STEPS;
      this.nextNoteTime += STEP_DUR;
    }
  }
}

let _music: Music | null = null;
export function getMusic(): Music {
  return (_music ??= new Music());
}
