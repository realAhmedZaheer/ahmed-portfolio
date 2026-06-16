import { describe, it, expect } from "vitest";
import { defragSound, MusicBed } from "./audio";

describe("defrag audio", () => {
  it("no-ops silently when sound is off (no audio context in jsdom)", () => {
    expect(() => defragSound("overflow")).not.toThrow();
    const bed = new MusicBed();
    expect(() => { bed.startHeartbeat(); bed.stop(); }).not.toThrow();
    expect(bed.running).toBe(false);
  });
});
