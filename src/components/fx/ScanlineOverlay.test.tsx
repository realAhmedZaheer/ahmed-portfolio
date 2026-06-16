import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScanlineOverlay } from "./ScanlineOverlay";

it("renders the decorative overlay", () => {
  render(<ScanlineOverlay />);
  expect(screen.getByTestId("scanlines")).toHaveAttribute("aria-hidden");
});
