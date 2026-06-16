import { describe, it, expect } from "vitest";
import { getMusic } from "./music";

describe("Music engine (jsdom-safe)", () => {
  it("start/trigger/intensity/stop never throw without an AudioContext, and beat() is null", () => {
    const m = getMusic();
    expect(() => {
      m.start();
      m.trigger("clear");
      m.setIntensityTarget(0.8);
      m.stop();
    }).not.toThrow();
    expect(m.beat()).toBeNull();
    expect(m.running).toBe(false);
  });
});
