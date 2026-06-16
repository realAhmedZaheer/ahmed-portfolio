import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoringPipelineDemo } from "./ScoringPipelineDemo";
import { scoringStages, scoringSamples } from "@/content/demos";
import { weightedScore } from "@/lib/scoring";

it("shows the weighted score for the first sample", () => {
  render(<ScoringPipelineDemo stages={scoringStages} samples={scoringSamples} />);
  const expected = String(weightedScore(scoringStages, scoringSamples[0].scores));
  expect(screen.getAllByText(new RegExp(expected)).length).toBeGreaterThan(0);
});

it("renders a selector for every sample", () => {
  render(<ScoringPipelineDemo stages={scoringStages} samples={scoringSamples} />);
  for (const s of scoringSamples) {
    expect(screen.getByRole("button", { name: s.label })).toBeInTheDocument();
  }
});
