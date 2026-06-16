import { describe, it, expect } from "vitest";
import { columnsForDelta, classifyRelease } from "./touchGestures";

describe("columnsForDelta", () => {
  it("maps drag distance to whole columns, signed", () => {
    expect(columnsForDelta(0, 30)).toBe(0);
    expect(columnsForDelta(29, 30)).toBe(0);
    expect(columnsForDelta(31, 30)).toBe(1);
    expect(columnsForDelta(95, 30)).toBe(3);
    expect(columnsForDelta(-31, 30)).toBe(-1);
  });

  it("is safe when cell size is unknown", () => {
    expect(columnsForDelta(100, 0)).toBe(0);
  });
});

describe("classifyRelease", () => {
  it("a quick stationary press is a tap (rotate)", () => {
    expect(classifyRelease({ dx: 3, dy: 4, dt: 120, movedCols: 0 })).toBe("tap");
  });

  it("a long downward flick is a hard drop", () => {
    expect(classifyRelease({ dx: 6, dy: 90, dt: 160, movedCols: 0 })).toBe("swipeDown");
  });

  it("a long upward flick is a hold", () => {
    expect(classifyRelease({ dx: -4, dy: -80, dt: 160, movedCols: 0 })).toBe("swipeUp");
  });

  it("a horizontal drag that moved columns is neither tap nor swipe", () => {
    expect(classifyRelease({ dx: 95, dy: 8, dt: 400, movedCols: 3 })).toBe("none");
  });

  it("a slow long stationary press is not a tap", () => {
    expect(classifyRelease({ dx: 2, dy: 2, dt: 600, movedCols: 0 })).toBe("none");
  });

  it("a mostly-horizontal flick does not count as a vertical swipe", () => {
    expect(classifyRelease({ dx: 80, dy: 40, dt: 150, movedCols: 0 })).toBe("none");
  });
});
