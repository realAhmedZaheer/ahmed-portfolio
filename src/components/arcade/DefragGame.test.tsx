import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DefragGame } from "./DefragGame";

describe("DefragGame", () => {
  it("mounts and shows the HUD throughput readout", () => {
    render(<DefragGame onExit={() => {}} />);
    expect(screen.getByText(/THR:/)).toBeInTheDocument();
  });
});
