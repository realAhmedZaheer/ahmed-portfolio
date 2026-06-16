import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectCard } from "./ProjectCard";
import { pillars } from "@/content/projects";

const project = pillars[0].cards[0];

it("renders title, blurb and tech chips", () => {
  render(<ProjectCard project={project} index={0} />);
  expect(screen.getByText(project.title)).toBeInTheDocument();
  expect(screen.getByText(project.blurb)).toBeInTheDocument();
  expect(screen.getByText(project.tech[0])).toBeInTheDocument();
});
