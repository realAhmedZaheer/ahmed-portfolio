import { describe, it, expect } from "vitest";
import { routeScenario } from "./agentDemo";
import { agentScenarios } from "@/content/demos";

describe("routeScenario", () => {
  it("finds a scenario by id", () => {
    const first = agentScenarios[0];
    expect(routeScenario(agentScenarios, first.id)?.tool).toBe(first.tool);
  });
  it("returns undefined for unknown id", () => {
    expect(routeScenario(agentScenarios, "nope")).toBeUndefined();
  });
});
