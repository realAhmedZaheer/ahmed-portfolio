import { describe, it, expect } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("a", false, "b")).toBe("a b");
  });
  it("drops null and undefined", () => {
    expect(cn("a", null, undefined, "b")).toBe("a b");
  });
});
