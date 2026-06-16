import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useReducedMotion } from "./useReducedMotion";

describe("useReducedMotion", () => {
  it("reflects matchMedia matches", () => {
    vi.stubGlobal(
      "matchMedia",
      (q: string) =>
        ({
          matches: true,
          media: q,
          addEventListener() {},
          removeEventListener() {},
        }) as unknown as MediaQueryList,
    );
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
    vi.unstubAllGlobals();
  });
});
