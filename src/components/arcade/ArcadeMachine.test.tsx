import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ArcadeMachine } from "./ArcadeMachine";
import { DEFRAG } from "./arcadeGames";

beforeEach(() => {
  window.localStorage.clear();
  // reduced motion → INSERT COIN goes straight to the game (no boot delay)
  window.localStorage.setItem("az_motion_v1", "reduced");
});

describe("ArcadeMachine", () => {
  it("boots into the fullscreen game on INSERT COIN", () => {
    render(<ArcadeMachine game={DEFRAG} onExitToWall={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /INSERT COIN/i }));
    expect(screen.getByText(/THR:/)).toBeInTheDocument();
  });

  it("opens the shop on TERMINAL and settings on SETTINGS", () => {
    render(<ArcadeMachine game={DEFRAG} onExitToWall={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /TERMINAL/i }));
    expect(screen.getByText(/TERMINAL SUPPLY/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /BACK TO CABINET/i }));
    fireEvent.click(screen.getByRole("button", { name: /SETTINGS/i }));
    expect(screen.getByText(/CONTROLS/)).toBeInTheDocument();
  });

  it("EXIT from the attract screen returns to the wall", () => {
    const onExitToWall = vi.fn();
    render(<ArcadeMachine game={DEFRAG} onExitToWall={onExitToWall} />);
    fireEvent.click(screen.getByRole("button", { name: /EXIT/i }));
    expect(onExitToWall).toHaveBeenCalled();
  });
});
