import { describe, it, expect } from "vitest";
import * as S from "./shaders";

describe("webgl shaders", () => {
  it("exports non-empty GLSL strings", () => {
    for (const [name, src] of Object.entries(S)) {
      expect(typeof src, name).toBe("string");
      expect((src as string).length, name).toBeGreaterThan(20);
      expect((src as string).includes("void main"), name).toBe(true);
    }
  });
});
