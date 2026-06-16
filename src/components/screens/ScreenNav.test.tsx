import { it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const pathMock = vi.fn(() => "/work");
vi.mock("next/navigation", () => ({ usePathname: () => pathMock() }));

import { ScreenNav } from "./ScreenNav";

beforeEach(() => pathMock.mockReturnValue("/work"));

it("shows both arrows on a mid-progression screen", () => {
  render(<ScreenNav />);
  expect(screen.getByRole("link", { name: /Previous screen: STATS/ })).toHaveAttribute("href", "/stats");
  expect(screen.getByRole("link", { name: /Next screen: LOG/ })).toHaveAttribute("href", "/campaign");
});

it("shows only forward on the first screen", () => {
  pathMock.mockReturnValue("/player");
  render(<ScreenNav />);
  expect(screen.queryByRole("link", { name: /Previous/ })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Next screen: STATS/ })).toHaveAttribute("href", "/stats");
});

it("shows only back on the last screen", () => {
  pathMock.mockReturnValue("/contact");
  render(<ScreenNav />);
  expect(screen.getByRole("link", { name: /Previous screen: LOG/ })).toHaveAttribute("href", "/campaign");
  expect(screen.queryByRole("link", { name: /Next/ })).not.toBeInTheDocument();
});

it("renders nothing on a side quest", () => {
  pathMock.mockReturnValue("/quest");
  const { container } = render(<ScreenNav />);
  expect(container).toBeEmptyDOMElement();
});
