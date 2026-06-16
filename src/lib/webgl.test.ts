import { describe, it, expect } from "vitest";
import { supportsWebGL } from "./webgl";

describe("supportsWebGL", () => {
  it("returns false in jsdom (no WebGL context)", () => {
    expect(supportsWebGL()).toBe(false);
  });
});
