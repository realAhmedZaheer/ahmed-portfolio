import { it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/lib/sfx", () => ({ playSound: vi.fn() }));

const reducedMock = vi.fn(() => false);
vi.mock("@/lib/motionPref", () => ({
  isReducedMotion: () => reducedMock(),
}));

import { QuestFlow } from "./QuestFlow";
import { questCategories } from "@/content/quest";

const agentic = questCategories[0];

beforeEach(() => {
  reducedMock.mockReturnValue(false);
});

it("walks category → specialization → forge (skippable) → tailored result", () => {
  render(<QuestFlow />);

  // step 1: category
  expect(screen.getByText(/What are you looking to build/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: new RegExp(agentic.label) }));

  // step 2: specialization
  expect(screen.getByText(/Get specific/)).toBeInTheDocument();
  const sub = agentic.subs[0];
  fireEvent.click(screen.getByRole("radio", { name: new RegExp(sub.label) }));
  fireEvent.change(screen.getByPlaceholderText(/RAG service/i), {
    target: { value: "a support-docs agent" },
  });
  fireEvent.click(screen.getByRole("button", { name: /FORGE IT/ }));

  // step 3: a forge minigame (random - assert via the shared shell)
  expect(screen.getByTestId("forge")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /SKIP/ }));

  // step 4: result - specialization-specific
  expect(screen.getByText(/ORDER COMPLETE/)).toBeInTheDocument();
  expect(screen.getAllByText(new RegExp(sub.spec[0].slice(0, 20))).length).toBeGreaterThan(0);
  const email = screen.getByRole("link", { name: /EMAIL ME/ });
  expect(email.getAttribute("href")).toContain(encodeURIComponent("a support-docs agent"));
});

it("BACK returns from the specialization screen to categories", () => {
  render(<QuestFlow />);
  fireEvent.click(screen.getByRole("button", { name: new RegExp(agentic.label) }));
  fireEvent.click(screen.getByRole("button", { name: /BACK/ }));
  expect(screen.getByText(/What are you looking to build/)).toBeInTheDocument();
});

it("surprise-me skips the specialization screen straight to the forge", () => {
  render(<QuestFlow />);
  fireEvent.click(screen.getByRole("button", { name: /NOT SURE YET/ }));
  expect(screen.queryByText(/Get specific/)).not.toBeInTheDocument();
  expect(screen.getByTestId("forge")).toBeInTheDocument();
});

it("skips the minigame entirely under reduced motion", () => {
  reducedMock.mockReturnValue(true);
  render(<QuestFlow />);
  fireEvent.click(screen.getByRole("button", { name: new RegExp(questCategories[1].label) }));
  fireEvent.click(screen.getByRole("radio", { name: new RegExp(questCategories[1].subs[0].label) }));
  fireEvent.click(screen.getByRole("button", { name: /FORGE IT/ }));
  expect(screen.getByText(/ORDER COMPLETE/)).toBeInTheDocument();
  expect(screen.queryByTestId("forge")).not.toBeInTheDocument();
});
