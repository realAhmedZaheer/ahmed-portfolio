import { isSoundOn } from "@/lib/soundPref";

/** Chiptune SFX engine - all sounds synthesized via Web Audio API, no audio assets. */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.18;
    master.connect(ctx.destination);
    const len = Math.floor(ctx.sampleRate * 0.4);
    noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }
  return ctx;
}

/** Create/resume the AudioContext. MUST be called from a user gesture. */
export function unlockAudio(): void {
  const c = getCtx();
  if (c && c.state === "suspended") void c.resume();
}

function tone(
  c: AudioContext,
  o: { type: OscillatorType; f0: number; f1?: number; t0: number; dur: number; vol: number },
): void {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type;
  osc.frequency.setValueAtTime(o.f0, o.t0);
  if (o.f1 != null) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f1), o.t0 + o.dur);
  g.gain.setValueAtTime(0.0001, o.t0);
  g.gain.exponentialRampToValueAtTime(o.vol, o.t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, o.t0 + o.dur);
  osc.connect(g);
  if (master) g.connect(master);
  osc.start(o.t0);
  osc.stop(o.t0 + o.dur + 0.03);
}

function noise(c: AudioContext, t0: number, dur: number, vol: number, lowpass?: number): void {
  if (!noiseBuffer) return;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  let node: AudioNode = src;
  if (lowpass) {
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = lowpass;
    src.connect(f);
    node = f;
  }
  node.connect(g);
  if (master) g.connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.03);
}

export type SfxName =
  | "move"
  | "hover"
  | "confirm"
  | "back"
  | "bootKey"
  | "warp"
  | "slam"
  | "cut"
  | "combo"
  | "gameover"
  | "achievement";

/** Play a named chiptune SFX. No-op when sound is off or audio isn't unlocked. */
export function playSound(name: SfxName): void {
  if (!isSoundOn()) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") {
    void c.resume().then(() => playSound(name));
    return;
  }
  if (c.state !== "running") return;
  const t = c.currentTime;

  switch (name) {
    case "move":
      tone(c, { type: "square", f0: 620, t0: t, dur: 0.06, vol: 0.25 });
      break;
    case "hover":
      tone(c, { type: "triangle", f0: 880, t0: t, dur: 0.035, vol: 0.12 });
      break;
    case "confirm":
      tone(c, { type: "square", f0: 523, t0: t, dur: 0.07, vol: 0.25 });
      tone(c, { type: "square", f0: 659, t0: t + 0.07, dur: 0.07, vol: 0.25 });
      tone(c, { type: "square", f0: 784, t0: t + 0.14, dur: 0.13, vol: 0.28 });
      break;
    case "back":
      tone(c, { type: "square", f0: 494, t0: t, dur: 0.08, vol: 0.22 });
      tone(c, { type: "square", f0: 330, t0: t + 0.08, dur: 0.12, vol: 0.22 });
      break;
    case "bootKey":
      tone(c, { type: "square", f0: 1180, t0: t, dur: 0.02, vol: 0.08 });
      break;
    case "warp":
      tone(c, { type: "sawtooth", f0: 110, f1: 1400, t0: t, dur: 1.1, vol: 0.16 });
      noise(c, t, 1.1, 0.05, 1200);
      break;
    case "slam":
      tone(c, { type: "sine", f0: 200, f1: 40, t0: t, dur: 0.32, vol: 0.32 });
      noise(c, t, 0.16, 0.22, 2200);
      break;
    case "cut":
      noise(c, t, 0.08, 0.18, 3200);
      tone(c, { type: "square", f0: 300, f1: 120, t0: t, dur: 0.08, vol: 0.14 });
      break;
    case "combo":
      tone(c, { type: "square", f0: 880, t0: t, dur: 0.05, vol: 0.22 });
      tone(c, { type: "square", f0: 1320, t0: t + 0.05, dur: 0.09, vol: 0.22 });
      break;
    case "achievement": {
      const seq = [523, 659, 784, 1047];
      seq.forEach((f, i) =>
        tone(c, { type: "square", f0: f, t0: t + i * 0.08, dur: 0.1, vol: 0.24 }),
      );
      tone(c, { type: "triangle", f0: 1568, t0: t + 0.34, dur: 0.22, vol: 0.14 });
      break;
    }
    case "gameover": {
      const seq = [523, 440, 349, 262];
      seq.forEach((f, i) =>
        tone(c, { type: "square", f0: f, t0: t + i * 0.18, dur: 0.16, vol: 0.26 }),
      );
      tone(c, { type: "square", f0: 196, f1: 110, t0: t + 0.74, dur: 0.6, vol: 0.28 });
      break;
    }
  }
}

/** Expose the shared AudioContext and master bus for other synths. */
export function getAudioContext(): AudioContext | null {
  return getCtx();
}
export { tone as playTone, noise as playNoise };
export function getMaster(): GainNode | null {
  return master;
}

/** Test-only reset. */
export function __resetSfxForTests(): void {
  ctx = null;
  master = null;
  noiseBuffer = null;
}
