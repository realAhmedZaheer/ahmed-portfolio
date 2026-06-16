import { describe, it, expect } from "vitest";
import { questCategories } from "./quest";

const allSubs = questCategories.flatMap((c) => c.subs);

describe("quest content", () => {
  it("has four categories; specific ones carry 3 specializations, surprise-me carries 1", () => {
    expect(questCategories).toHaveLength(4);
    for (const c of questCategories) {
      expect(c.subs.length).toBeGreaterThanOrEqual(1);
    }
    expect(questCategories.find((c) => c.id === "unsure")?.subs).toHaveLength(1);
  });

  it("every specialization is fully populated", () => {
    for (const s of allSubs) {
      expect(s.parts.length).toBeGreaterThanOrEqual(5);
      expect(s.spec.length).toBeGreaterThanOrEqual(3);
      expect(s.demo).toBeTruthy();
    }
  });

  it("spec lines describe the demo, not resume credentials", () => {
    // demo-only copy: no first-person 'I shipped/built …' résumé claims
    const text = allSubs.flatMap((s) => s.spec).join(" ");
    expect(/\bI (shipped|built|led|designed)\b/.test(text)).toBe(false);
  });

  it("never names the confidential internal product", () => {
    const text = JSON.stringify(questCategories).toLowerCase();
    expect(text.includes("aix")).toBe(false);
  });
});
