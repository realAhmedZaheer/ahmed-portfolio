import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComboCounter } from "./ComboCounter";

it("renders the hit count", () => {
  render(<ComboCounter hits={21} />);
  expect(screen.getByText("21 HITS")).toBeInTheDocument();
});
