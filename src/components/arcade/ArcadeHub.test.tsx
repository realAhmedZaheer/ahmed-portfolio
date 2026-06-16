import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ArcadeHub } from "./ArcadeHub";

beforeEach(() => window.localStorage.clear());

describe("ArcadeHub", () => {
  it("shows the DEFRAG cabinet and a coming-soon tile", () => {
    render(<ArcadeHub />);
    expect(screen.getByText(/DEFRAG\.EXE/)).toBeInTheDocument();
    expect(screen.getAllByText(/OUT OF ORDER/i).length).toBeGreaterThan(0);
  });

  it("opens the maximized machine view when the DEFRAG cabinet is selected", () => {
    render(<ArcadeHub />);
    fireEvent.click(screen.getByRole("button", { name: /play DEFRAG/i }));
    // the machine view shows the deck controls, not the game itself
    expect(screen.getByRole("button", { name: /INSERT COIN/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /SETTINGS/i })).toBeInTheDocument();
  });
});
