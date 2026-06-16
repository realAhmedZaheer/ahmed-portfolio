import { describe, it, expect } from "vitest";
import { makeGatekeeper, damageBoss, bossVoiceFor } from "./bosses";

describe("GATEKEEPER.SYS", () => {
  it("starts at full HP with a name and attack cadence", () => {
    const b = makeGatekeeper();
    expect(b.name).toBe("GATEKEEPER.SYS");
    expect(b.hp).toBe(b.maxHp);
    expect(b.attackEveryMs).toBe(12000);
  });

  it("damage reduces HP and never goes below 0", () => {
    const b = makeGatekeeper();
    const d = damageBoss(b, 3);
    expect(d.hp).toBe(b.maxHp - 3);
    expect(damageBoss({ ...b, hp: 2 }, 5).hp).toBe(0);
  });

  it("speeds up its attack cadence below 50% HP", () => {
    const b = makeGatekeeper();
    expect(damageBoss(b, b.maxHp / 2).attackEveryMs).toBe(8000);
  });

  it("selects a voice line by HP fraction", () => {
    expect(bossVoiceFor(1)).toMatch(/UNAUTHORIZED|DETECTED/);
    expect(bossVoiceFor(0)).toMatch(/TERMINATED/);
    expect(bossVoiceFor(0.2)).toMatch(/CONTAINMENT/);
  });
});
