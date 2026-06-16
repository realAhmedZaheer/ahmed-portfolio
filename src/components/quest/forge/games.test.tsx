import { it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

vi.mock("@/lib/sfx", () => ({ playSound: vi.fn() }));

import { InvadersGame } from "./InvadersGame";
import { CatchGame } from "./CatchGame";
import { SolderGame } from "./SolderGame";

const PARTS = ["ALPHA", "BETA", "GAMMA"];

afterEach(() => {
  vi.useRealTimers();
});

// each game exposes a tappable affordance per part with these labels
const GAMES = [
  { name: "invaders", Comp: InvadersGame, verb: "Shoot" },
  { name: "catch", Comp: CatchGame, verb: "Catch" },
  { name: "solder", Comp: SolderGame, verb: "Solder" },
] as const;

for (const { name, Comp, verb } of GAMES) {
  it(`${name}: renders the forge shell and fills the meter on collect`, () => {
    render(<Comp parts={PARTS} onComplete={vi.fn()} />);
    expect(screen.getByTestId("forge")).toBeInTheDocument();
    expect(screen.getByText(`0/${PARTS.length}`)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: `${verb} ${PARTS[0]}` }));
    expect(screen.getByText(`1/${PARTS.length}`)).toBeInTheDocument();
  });
}

it("completes (COMPILING → onComplete) once every part is collected", () => {
  vi.useFakeTimers();
  const onComplete = vi.fn();
  render(<SolderGame parts={PARTS} onComplete={onComplete} />);
  for (const p of PARTS) {
    fireEvent.click(screen.getByRole("button", { name: `Solder ${p}` }));
  }
  expect(screen.getByText(`${PARTS.length}/${PARTS.length}`)).toBeInTheDocument();
  expect(onComplete).not.toHaveBeenCalled();
  act(() => {
    vi.advanceTimersByTime(1300);
  });
  expect(onComplete).toHaveBeenCalledTimes(1);
});

it("SKIP completes immediately", () => {
  const onComplete = vi.fn();
  render(<InvadersGame parts={PARTS} onComplete={onComplete} />);
  fireEvent.click(screen.getByRole("button", { name: /SKIP/ }));
  expect(onComplete).toHaveBeenCalledTimes(1);
});
