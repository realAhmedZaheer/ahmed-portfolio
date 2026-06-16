import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

it("renders the credit line", () => {
  render(<Footer />);
  expect(screen.getByText(/AHMED ZAHEER/)).toBeInTheDocument();
  expect(screen.getByText(/NO COINS REQUIRED/)).toBeInTheDocument();
});
