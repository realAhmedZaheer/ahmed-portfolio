import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CampaignLog } from "./CampaignLog";

it("renders DesignGurus entries and the prologue", () => {
  render(<CampaignLog />);
  expect(screen.getAllByText("DesignGurus").length).toBeGreaterThanOrEqual(2);
  expect(screen.getByText("PROLOGUE")).toBeInTheDocument();
  expect(screen.getByText("CURRENT QUEST")).toBeInTheDocument();
});
