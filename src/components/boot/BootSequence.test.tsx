import { render, screen } from "@testing-library/react";
import { vi, it, expect } from "vitest";

vi.mock("@/lib/boot", () => ({
  shouldPlayBoot: () => false,
  markBootSeen: vi.fn(),
  markBootPlayedThisLoad: vi.fn(),
}));

vi.mock("@/lib/motionPref", () => ({
  getStoredMotionPref: () => "full",
  isReducedMotion: () => false,
  MOTION_EVENT: "az-motion-change",
}));

vi.mock("@/lib/soundPref", () => ({
  getStoredSoundPref: () => "off",
  SOUND_EVENT: "az-sound-change",
  isSoundOn: () => false,
}));

vi.mock("@/lib/sfx", () => ({ playSound: vi.fn() }));

import { BootSequence } from "./BootSequence";

it("completes immediately when the boot was already seen", () => {
  const onComplete = vi.fn();
  render(<BootSequence onComplete={onComplete} />);
  expect(onComplete).toHaveBeenCalled();
  expect(screen.queryByText(/SKIP/)).not.toBeInTheDocument();
});
