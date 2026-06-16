import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Section } from "./Section";

it("exposes an accessible heading distinct from the game name", () => {
  render(
    <Section id="stats" num="04" gameName="STATS · INVENTORY" srLabel="Skills">
      <p>body</p>
    </Section>,
  );
  expect(screen.getByRole("heading", { name: "Skills" })).toBeInTheDocument();
  expect(screen.getByText("STATS · INVENTORY")).toBeInTheDocument();
  expect(screen.getByText("body")).toBeInTheDocument();
});
