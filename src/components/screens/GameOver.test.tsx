import { it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

import { GameOver } from "./GameOver";

afterEach(() => {
  vi.useRealTimers();
  push.mockClear();
});

it("shows the GAME OVER transition on FINISH, then loads the campaign log", () => {
  vi.useFakeTimers();
  render(<GameOver />);

  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /FINISH/ }));

  expect(screen.getByRole("status")).toBeInTheDocument();
  expect(screen.getByText(/LOADING/)).toBeInTheDocument();
  expect(push).not.toHaveBeenCalled();

  act(() => {
    vi.advanceTimersByTime(3000);
  });
  expect(push).toHaveBeenCalledWith("/contact");
});
