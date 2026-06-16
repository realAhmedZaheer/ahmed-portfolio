import { describe, it, expect } from "vitest";
import { profile } from "./profile";
import { skills } from "./skills";
import { experience } from "./experience";
import { contact } from "./contact";
import { pillars } from "./projects";

describe("content", () => {
  it("profile is populated", () => {
    expect(profile.name).toBe("Ahmed Zaheer");
    expect(profile.education.length).toBeGreaterThan(0);
  });
  it("skills have 5 categories with items", () => {
    expect(skills).toHaveLength(5);
    skills.forEach((c) => expect(c.items.length).toBeGreaterThan(0));
  });
  it("experience includes DesignGurus and a prologue", () => {
    expect(experience.some((e) => e.org === "DesignGurus")).toBe(true);
    expect(experience.some((e) => e.kind === "prologue")).toBe(true);
  });
  it("contact exposes email + linkedin", () => {
    expect(contact.some((c) => c.label === "Email")).toBe(true);
    expect(contact.some((c) => c.label === "LinkedIn")).toBe(true);
  });
});

describe("pillars", () => {
  it("has two pillars, each with a boss + cards", () => {
    expect(pillars).toHaveLength(2);
    pillars.forEach((p) => {
      expect(p.boss.id).toBeTruthy();
      expect(p.cards.length).toBeGreaterThan(0);
    });
  });
  it("pillar bosses map to the two demo kinds", () => {
    const demos = pillars.map((p) => p.boss.demo).sort();
    expect(demos).toEqual(["agent-tool-call", "scoring-pipeline"]);
  });
});
