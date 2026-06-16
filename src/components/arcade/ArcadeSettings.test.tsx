import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ArcadeSettings } from "./ArcadeSettings";
import { isSoundOn } from "@/lib/soundPref";

beforeEach(() => window.localStorage.clear());

describe("ArcadeSettings", () => {
  it("renders sound, motion, and the controls reference", () => {
    render(<ArcadeSettings />);
    expect(screen.getByText("SOUND")).toBeInTheDocument();
    expect(screen.getByText("MOTION")).toBeInTheDocument();
    expect(screen.getByText(/CONTROLS/)).toBeInTheDocument();
    expect(screen.getByText("HARD DROP")).toBeInTheDocument();
  });

  it("toggles the sound preference", () => {
    render(<ArcadeSettings />);
    expect(isSoundOn()).toBe(false);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /OFF/i }));
    });
    expect(isSoundOn()).toBe(true);
  });
});
