import { it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

import { TitleScreen } from "./TitleScreen";

afterEach(() => {
  vi.useRealTimers();
  push.mockClear();
});

it("renders the wordmark and all five menu routes", () => {
  render(<TitleScreen />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/AHMED/);
  expect(screen.getByRole("link", { name: /START/ })).toHaveAttribute("href", "/player");
  expect(screen.getByRole("link", { name: /LEVEL SELECT/ })).toHaveAttribute("href", "/work");
  expect(screen.getByRole("link", { name: /STATS/ })).toHaveAttribute("href", "/stats");
  expect(screen.getByRole("link", { name: /CAMPAIGN LOG/ })).toHaveAttribute("href", "/campaign");
  expect(screen.getByRole("link", { name: /CONTINUE/ })).toHaveAttribute("href", "/contact");
});

it("plays the pixel-burst loader on START, then navigates to player select", () => {
  vi.useFakeTimers();
  render(<TitleScreen />);

  fireEvent.click(screen.getByRole("link", { name: /START/ }));
  expect(screen.getByText("NOW LOADING")).toBeInTheDocument();
  expect(push).not.toHaveBeenCalled();

  act(() => {
    vi.advanceTimersByTime(3000);
  });
  expect(push).toHaveBeenCalledWith("/player");
});
