import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdvanceButton } from "./AdvanceButton";

it("renders a link to the next screen", () => {
  render(<AdvanceButton href="/stats" label="SELECT PLAYER" next="STATS" />);
  expect(screen.getByRole("link", { name: /SELECT PLAYER/ })).toHaveAttribute("href", "/stats");
  expect(screen.getByText(/NEXT: STATS/)).toBeInTheDocument();
});
