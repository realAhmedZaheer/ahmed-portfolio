import { it, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { WarpLoading } from "./WarpLoading";

afterEach(() => {
  vi.useRealTimers();
});

it("shows the warp HUD and completes after the loading bar fills", () => {
  vi.useFakeTimers();
  const onComplete = vi.fn();
  render(<WarpLoading onComplete={onComplete} />);

  expect(screen.getByRole("status", { name: /loading/i })).toBeInTheDocument();
  expect(screen.getByText(/WORLD/)).toBeInTheDocument();
  expect(screen.getByText("LOADING", { exact: false })).toBeInTheDocument();
  expect(onComplete).not.toHaveBeenCalled();

  act(() => {
    vi.advanceTimersByTime(3000);
  });
  expect(onComplete).toHaveBeenCalledTimes(1);
});
