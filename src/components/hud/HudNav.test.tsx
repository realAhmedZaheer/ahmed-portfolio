import { it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/work",
}));

import { HudNav } from "./HudNav";

it("renders a tab for each screen and marks the active route", () => {
  render(<HudNav />);
  for (const label of ["WORK", "STATS", "PLAYER", "LOG", "CONTACT"]) {
    expect(screen.getByRole("link", { name: new RegExp(label) })).toBeInTheDocument();
  }
  expect(screen.getByRole("link", { name: /WORK/ })).toHaveAttribute("aria-current", "page");
});
