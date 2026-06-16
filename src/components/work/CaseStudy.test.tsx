import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseStudy } from "./CaseStudy";
import { pillars } from "@/content/projects";

const boss = pillars[0].boss;

it("renders title, metrics and the demo placeholder", () => {
  render(<CaseStudy study={boss} />);
  expect(screen.getByText(boss.title)).toBeInTheDocument();
  for (const m of boss.metrics) {
    expect(screen.getAllByText(m.value).length).toBeGreaterThan(0);
  }
  expect(screen.getByText(/DEMO LOADS HERE/)).toBeInTheDocument();
});

it("renders children in the demo slot instead of the placeholder", () => {
  render(
    <CaseStudy study={boss}>
      <div>live demo</div>
    </CaseStudy>,
  );
  expect(screen.getByText("live demo")).toBeInTheDocument();
  expect(screen.queryByText(/DEMO LOADS HERE/)).not.toBeInTheDocument();
});
