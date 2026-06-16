import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProfileCard } from "./ProfileCard";
import { profile } from "@/content/profile";

it("renders the bio, location and pixel avatar", () => {
  render(<ProfileCard />);
  expect(screen.getByText(profile.bioFirstPerson)).toBeInTheDocument();
  expect(screen.getByText(/Melbourne/)).toBeInTheDocument();
  expect(screen.getByRole("img", { name: /pixel-art avatar/i })).toBeInTheDocument();
});

it("has a SELECT button advancing to the stats screen", () => {
  render(<ProfileCard />);
  expect(screen.getByRole("link", { name: /SELECT/ })).toHaveAttribute("href", "/stats");
});
