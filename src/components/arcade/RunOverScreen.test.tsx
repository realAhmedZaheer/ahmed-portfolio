import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RunOverScreen } from "./RunOverScreen";

describe("RunOverScreen", () => {
  it("shows the win panel with a high-score star and fires primary", () => {
    const onPrimary = vi.fn();
    render(
      <RunOverScreen kind="won" score={18600} level={6} lines={52} bits={186}
        isHighScore onPrimary={onPrimary} onExit={() => {}} />,
    );
    expect(screen.getByText(/SECTOR CLEARED/)).toBeInTheDocument();
    expect(screen.getByText(/NEW HIGH SCORE/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /CONTINUE/i }));
    expect(onPrimary).toHaveBeenCalled();
  });

  it("shows the failure panel on loss", () => {
    render(
      <RunOverScreen kind="over" score={12400} level={4} lines={38} bits={124}
        isHighScore={false} onPrimary={() => {}} onExit={() => {}} />,
    );
    expect(screen.getByText(/SYSTEM FAILURE/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /RETRY/i })).toBeInTheDocument();
  });
});
