import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Playfield } from "./Playfield";
import { initialState, reduce } from "@/lib/defrag/engine";

describe("Playfield", () => {
  it("renders a canvas for a started game", () => {
    const state = reduce(initialState(), { type: "START", seed: 1 });
    const { container } = render(<Playfield state={state} />);
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });
});
