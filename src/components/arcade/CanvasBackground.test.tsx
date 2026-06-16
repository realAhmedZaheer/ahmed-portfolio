import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CanvasBackground } from "./CanvasBackground";

describe("CanvasBackground", () => {
  it("renders a canvas without throwing", () => {
    const { container } = render(<CanvasBackground danger={0.5} />);
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });
});
