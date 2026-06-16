import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Sigil } from "./Sigil";

describe("Sigil", () => {
  it("renders the padlock glyph as an SVG when intact", () => {
    const { container } = render(<Sigil hpFraction={1} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg!.querySelectorAll("rect").length).toBeGreaterThan(10);
  });

  it("draws white fracture pixels once cracked", () => {
    const { container } = render(<Sigil hpFraction={0.4} />);
    const whites = [...container.querySelectorAll("rect")].filter(
      (r) => r.getAttribute("fill") === "#f5f3ff",
    );
    expect(whites.length).toBeGreaterThan(0);
  });

  it("scatters into shard particles on defeat (no SVG)", () => {
    const { container } = render(<Sigil hpFraction={0} />);
    expect(container.querySelector("svg")).toBeNull();
    expect(container.querySelectorAll(".sigil-shard").length).toBeGreaterThan(10);
  });
});
