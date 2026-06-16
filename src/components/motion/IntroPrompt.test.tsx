import { it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/lib/sfx", () => ({ unlockAudio: vi.fn(), playSound: vi.fn() }));

import { IntroPrompt } from "./IntroPrompt";
import { MOTION_KEY } from "@/lib/motionPref";
import { SOUND_KEY } from "@/lib/soundPref";

beforeEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset.motion;
});

it("asks on first load and stores FULL FX + sound on", () => {
  render(<IntroPrompt />);
  expect(screen.getByRole("dialog", { name: /experience options/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /FULL FX.*SOUND ON/ }));
  expect(window.localStorage.getItem(MOTION_KEY)).toBe("full");
  expect(window.localStorage.getItem(SOUND_KEY)).toBe("on");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("stores MINIMAL as reduced motion + sound off", () => {
  render(<IntroPrompt />);
  fireEvent.click(screen.getByRole("button", { name: /MINIMAL/ }));
  expect(window.localStorage.getItem(MOTION_KEY)).toBe("reduced");
  expect(window.localStorage.getItem(SOUND_KEY)).toBe("off");
});

it("does not ask again once both prefs are answered", () => {
  window.localStorage.setItem(MOTION_KEY, "full");
  window.localStorage.setItem(SOUND_KEY, "off");
  render(<IntroPrompt />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
