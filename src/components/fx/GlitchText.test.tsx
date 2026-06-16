import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GlitchText } from "./GlitchText";

it("renders its text with the glitch data attribute", () => {
  render(<GlitchText text="AHMED" />);
  const el = screen.getByText("AHMED");
  expect(el).toBeInTheDocument();
  expect(el).toHaveAttribute("data-text", "AHMED");
});

it("renders as the requested tag", () => {
  render(<GlitchText text="ZAHEER" as="h1" />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("ZAHEER");
});
