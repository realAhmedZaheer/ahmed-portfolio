import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkPillar } from "./WorkPillar";
import { pillars } from "@/content/projects";

it("renders the boss case study and every project card", () => {
  render(<WorkPillar pillar={pillars[0]} num="02" />);
  expect(screen.getByText(pillars[0].boss.title)).toBeInTheDocument();
  expect(screen.getAllByRole("article")).toHaveLength(pillars[0].cards.length);
});
