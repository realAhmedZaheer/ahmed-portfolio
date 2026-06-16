import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AchievementToaster } from "./AchievementToaster";
import { ACH_EVENT } from "@/lib/achievements";

beforeEach(() => {
  vi.useFakeTimers();
  window.localStorage.clear();
});
afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

function fire(id: string) {
  act(() => {
    window.dispatchEvent(new CustomEvent(ACH_EVENT, { detail: { id } }));
  });
}

describe("AchievementToaster", () => {
  it("shows a toast with the achievement title on ACH_EVENT", () => {
    render(<AchievementToaster />);
    fire("campaign-clear");
    expect(screen.getByText("ACHIEVEMENT UNLOCKED")).toBeInTheDocument();
    expect(screen.getByText("CAMPAIGN CLEARED")).toBeInTheDocument();
  });

  it("queues a second unlock and shows it after the first dismisses", () => {
    render(<AchievementToaster />);
    fire("campaign-clear");
    fire("full-tour");
    expect(screen.getByText("CAMPAIGN CLEARED")).toBeInTheDocument();
    expect(screen.queryByText("ROLL CALL")).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByText("ROLL CALL")).toBeInTheDocument();
  });

  it("ignores unknown ids", () => {
    render(<AchievementToaster />);
    fire("nope");
    expect(screen.queryByText("ACHIEVEMENT UNLOCKED")).not.toBeInTheDocument();
  });
});
