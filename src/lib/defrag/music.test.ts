import { describe, it, expect } from "vitest";
import { noteHz, layerGains, quantizeTime } from "./music";

describe("music helpers", () => {
  it("noteHz maps scale degrees to rising frequencies off a ~110Hz root", () => {
    expect(noteHz(0)).toBeCloseTo(110, 0);
    expect(noteHz(5)).toBeCloseTo(220, 0); // one octave up the pentatonic
    expect(noteHz(1)).toBeGreaterThan(noteHz(0));
    expect(noteHz(6)).toBeGreaterThan(noteHz(5));
  });

  it("layerGains escalates stems with intensity", () => {
    const lo = layerGains(0), hi = layerGains(1);
    expect(lo.kick).toBeGreaterThan(0); // kick always audible
    expect(lo.bass).toBe(0);
    expect(lo.arp).toBe(0);
    expect(lo.pad).toBe(0);
    expect(hi.kick).toBeGreaterThanOrEqual(lo.kick);
    expect(hi.bass).toBeGreaterThan(0);
    expect(hi.arp).toBeGreaterThan(0);
    expect(hi.pad).toBeGreaterThan(0);
    expect(layerGains(0.5).arp).toBeLessThan(hi.arp);
  });

  it("quantizeTime returns the next step boundary >= now", () => {
    expect(quantizeTime(1.0, 1.0, 0.1)).toBeCloseTo(1.0);
    expect(quantizeTime(1.05, 1.0, 0.1)).toBeCloseTo(1.1);
    expect(quantizeTime(1.1, 1.0, 0.1)).toBeCloseTo(1.1);
    expect(quantizeTime(0.5, 1.0, 0.1)).toBeCloseTo(1.0); // before start → start
  });
});
