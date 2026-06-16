import { it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/lib/sfx", () => ({ playSound: vi.fn() }));
// reduced motion → all demos render their instant/final states (deterministic)
vi.mock("@/lib/motionPref", () => ({ isReducedMotion: () => true }));

import { RagRetrievalDemo } from "./RagRetrievalDemo";
import { StreamChatDemo } from "./StreamChatDemo";
import { WorkerOrchestratorDemo } from "./WorkerOrchestratorDemo";
import { DashboardDemo } from "./DashboardDemo";
import { ApiPlaygroundDemo } from "./ApiPlaygroundDemo";

it("RAG demo retrieves the refund doc for a refund question", () => {
  render(<RagRetrievalDemo />);
  fireEvent.click(screen.getByRole("button", { name: /refund on my purchase/i }));
  expect(screen.getByText(/GROUNDED ANSWER/)).toBeInTheDocument();
  expect(screen.getAllByText(/Refund policy/).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/RETRIEVED/).length).toBeGreaterThan(0);
});

it("chat demo answers a preset instantly under reduced motion", () => {
  render(<StreamChatDemo />);
  fireEvent.click(screen.getByRole("button", { name: /signups trend/i }));
  expect(screen.getByText(/up 23% week over week/)).toBeInTheDocument();
});

it("orchestrator queues jobs and survives a worker kill", () => {
  render(<WorkerOrchestratorDemo />);
  expect(screen.getByText("QUEUE 3")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /ADD JOB/ }));
  expect(screen.getByText("QUEUE 4")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /KILL WORKER/ }));
  expect(screen.getAllByText(/DEAD/).length).toBeGreaterThan(0);
});

it("dashboard renders KPIs and range filters", () => {
  render(<DashboardDemo />);
  for (const label of ["MRR", "ACTIVE USERS", "P95 LATENCY"]) {
    expect(screen.getByText(label)).toBeInTheDocument();
  }
  fireEvent.click(screen.getByRole("button", { name: "30D" }));
  expect(screen.getByRole("button", { name: "30D" })).toHaveAttribute("aria-pressed", "true");
});

it("API playground shows the typed contract for an endpoint", () => {
  render(<ApiPlaygroundDemo />);
  fireEvent.click(screen.getByRole("button", { name: /metrics\?range=30d/ }));
  expect(screen.getByText(/200 OK/)).toBeInTheDocument();
  expect(screen.getByText(/CACHE HIT/)).toBeInTheDocument();
  expect(screen.getByText(/"mrr": 21200/)).toBeInTheDocument();
});
