import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { AchievementCounter } from "./AchievementCounter";
import { unlock, ACH_KEY } from "@/lib/achievements";

beforeEach(() => {
  window.localStorage.clear();
});

describe("AchievementCounter", () => {
  it("renders the unlocked count over the total", () => {
    window.localStorage.setItem(ACH_KEY, JSON.stringify(["sound-on", "first-contact"]));
    render(<AchievementCounter />);
    expect(screen.getByRole("button", { name: /achievements/i })).toHaveTextContent("2/10");
  });

  it("opens the panel on click and lists a locked row as ???", () => {
    render(<AchievementCounter />);
    fireEvent.click(screen.getByRole("button", { name: /achievements/i }));
    expect(screen.getByRole("dialog", { name: /achievements/i })).toBeInTheDocument();
    expect(screen.getAllByText("???").length).toBeGreaterThan(0);
  });

  it("reflects a live unlock without remount", () => {
    render(<AchievementCounter />);
    const btn = screen.getByRole("button", { name: /achievements/i });
    expect(btn).toHaveTextContent("0/10");
    act(() => {
      unlock("sound-on");
    });
    expect(btn).toHaveTextContent("1/10");
  });
});
