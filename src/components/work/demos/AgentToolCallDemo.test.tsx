import { it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentToolCallDemo } from "./AgentToolCallDemo";
import { agentScenarios } from "@/content/demos";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

it("routes a preset query to a tool and shows the (illustrative) result", async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({
      source: "illustrative",
      tool: "get_revenue_rollup",
      args: { range: "last_quarter" },
      result: "Q rollup: +18% QoQ. (illustrative)",
      reply: "",
    }),
  });

  render(<AgentToolCallDemo scenarios={agentScenarios} />);
  await userEvent.click(screen.getByText(agentScenarios[0].prompt));

  expect(await screen.findByText(/get_revenue_rollup/)).toBeInTheDocument();
  expect(screen.getAllByText(/illustrative/i).length).toBeGreaterThan(0);
});

it("shows an offline message when the request fails", async () => {
  fetchMock.mockRejectedValue(new Error("network"));
  render(<AgentToolCallDemo scenarios={agentScenarios} />);
  await userEvent.click(screen.getByText(agentScenarios[1].prompt));
  expect(await screen.findByText(/agent offline/i)).toBeInTheDocument();
});
