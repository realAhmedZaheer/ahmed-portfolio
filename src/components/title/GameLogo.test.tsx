import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GameLogo } from "./GameLogo";

it("renders the wordmark with glitch layers and the mode badge", () => {
  render(<GameLogo />);
  const wordmark = screen.getByText("AHMED ZAHEER");
  expect(wordmark).toBeInTheDocument();
  expect(wordmark).toHaveAttribute("data-text", "AHMED ZAHEER");
  expect(screen.getByText(/SUPER ★ 999 MODE/)).toBeInTheDocument();
});
