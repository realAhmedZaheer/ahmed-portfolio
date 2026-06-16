import { describe, it, expect, beforeEach } from "vitest";
import {
  getMeta, addBits, setHiScore, getHiScore, applyUpgrades, META_KEY,
  UPGRADES, getBits, levelOf, buyUpgrade, nextCost,
} from "./meta";
import { DEFAULT_CONFIG } from "./types";

beforeEach(() => window.localStorage.clear());

describe("defrag meta", () => {
  it("defaults to zero bits and no upgrades", () => {
    expect(getMeta()).toEqual({ bits: 0, upgrades: {} });
  });
  it("accumulates bits", () => {
    addBits(50);
    addBits(75);
    expect(getMeta().bits).toBe(125);
    expect(window.localStorage.getItem(META_KEY)).toContain("125");
  });
  it("keeps the max high score", () => {
    setHiScore(1000);
    setHiScore(500);
    expect(getHiScore()).toBe(1000);
  });
  it("applyUpgrades with nothing owned returns the default config", () => {
    expect(applyUpgrades(DEFAULT_CONFIG)).toEqual(DEFAULT_CONFIG);
  });
  it("swallows storage errors", () => {
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new Error("quota"); };
    expect(() => addBits(10)).not.toThrow();
    Storage.prototype.setItem = orig;
  });
});

describe("defrag upgrades", () => {
  it("ships the seven TERMINAL SUPPLY upgrades", () => {
    expect(UPGRADES.map((u) => u.id).sort()).toEqual(
      ["charge-rate", "crit-clear", "garbage-res", "hold-two", "queue-plus", "slow-grav", "start-bomb"],
    );
  });

  it("buyUpgrade spends bits and increments the level", () => {
    addBits(1000);
    expect(buyUpgrade("queue-plus")).toBe(true);
    expect(levelOf("queue-plus")).toBe(1);
    expect(getBits()).toBe(850);
  });

  it("refuses when unaffordable or maxed", () => {
    addBits(250);
    expect(buyUpgrade("slow-grav")).toBe(true);   // I: 250 → 0
    expect(buyUpgrade("slow-grav")).toBe(false);  // can't afford II (450)
    addBits(10000);
    expect(buyUpgrade("slow-grav")).toBe(true);   // II
    expect(buyUpgrade("slow-grav")).toBe(true);   // III
    expect(buyUpgrade("slow-grav")).toBe(false);  // maxed (3 tiers)
    expect(nextCost("slow-grav")).toBeNull();
  });

  it("applyUpgrades folds owned levels into the config", () => {
    addBits(99999);
    buyUpgrade("queue-plus");
    buyUpgrade("start-bomb");
    buyUpgrade("hold-two");
    buyUpgrade("garbage-res");
    buyUpgrade("crit-clear");
    buyUpgrade("charge-rate"); buyUpgrade("charge-rate"); // II
    buyUpgrade("slow-grav"); buyUpgrade("slow-grav"); buyUpgrade("slow-grav"); // III
    const cfg = applyUpgrades(DEFAULT_CONFIG);
    expect(cfg.queueSize).toBe(6);
    expect(cfg.startCharge).toBe(100);
    expect(cfg.holdSlots).toBe(2);
    expect(cfg.garbageGaps).toBe(2);
    expect(cfg.critChance).toBeCloseTo(0.1);
    expect(cfg.chargePerLine).toBe(30);
    expect(cfg.gravityScale).toBeCloseTo(1.4);
    expect(DEFAULT_CONFIG.queueSize).toBe(5); // not mutated
  });

  it("migrates the old string[] upgrades shape to a level map", () => {
    window.localStorage.setItem(META_KEY, JSON.stringify({ bits: 5, upgrades: ["queue-plus"] }));
    expect(levelOf("queue-plus")).toBe(1);
    expect(getBits()).toBe(5);
  });
});
