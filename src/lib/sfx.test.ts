import { describe, it, expect, beforeEach, vi } from "vitest";
import { playSound, unlockAudio, __resetSfxForTests } from "./sfx";
import { setSoundPref } from "./soundPref";

/** Minimal Web Audio mock so we can assert nodes get created / scheduled. */
function installAudioMock() {
  const osc = () => ({
    type: "square",
    frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  });
  const gain = () => ({
    gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  });
  const created = { oscillators: 0 };
  class MockAudioContext {
    state = "running";
    currentTime = 0;
    sampleRate = 44100;
    destination = {};
    createGain = vi.fn(() => gain());
    createOscillator = vi.fn(() => {
      created.oscillators++;
      return osc();
    });
    createBufferSource = vi.fn(() => ({ buffer: null, connect: vi.fn(), start: vi.fn(), stop: vi.fn() }));
    createBiquadFilter = vi.fn(() => ({ type: "lowpass", frequency: { value: 0 }, connect: vi.fn() }));
    createBuffer = vi.fn(() => ({ getChannelData: () => new Float32Array(16) }));
    resume = vi.fn();
  }
  vi.stubGlobal("AudioContext", MockAudioContext as unknown as typeof AudioContext);
  return created;
}

beforeEach(() => {
  __resetSfxForTests();
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

describe("sfx", () => {
  it("is a no-op when sound is off (never creates an AudioContext)", () => {
    const created = installAudioMock();
    // sound pref unset → off
    playSound("confirm");
    expect(created.oscillators).toBe(0);
  });

  it("synthesizes a sound when sound is on and unlocked", () => {
    const created = installAudioMock();
    setSoundPref(window.localStorage, "on");
    unlockAudio();
    playSound("confirm");
    expect(created.oscillators).toBeGreaterThan(0);
  });
});
