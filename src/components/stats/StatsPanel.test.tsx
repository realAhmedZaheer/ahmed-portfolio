import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsPanel } from "./StatsPanel";
import { skills } from "@/content/skills";

it("renders all five skill categories", () => {
  render(<StatsPanel />);
  for (const cat of skills) {
    expect(screen.getByText(cat.name.toUpperCase())).toBeInTheDocument();
  }
});
