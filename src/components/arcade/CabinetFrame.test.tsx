import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CabinetFrame } from "./CabinetFrame";

describe("CabinetFrame", () => {
  it("renders the marquee title, the screen children, and the deck buttons", () => {
    const play = vi.fn();
    render(
      <CabinetFrame
        title="DEFRAG.EXE"
        buttons={[
          { label: "INSERT COIN", onClick: play, primary: true, tone: "cyan" },
          { label: "EXIT", onClick: () => {}, tone: "pink" },
        ]}
      >
        <p>SCREEN CONTENT</p>
      </CabinetFrame>,
    );
    expect(screen.getByText("DEFRAG.EXE")).toBeInTheDocument();
    expect(screen.getByText("SCREEN CONTENT")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "INSERT COIN" }));
    expect(play).toHaveBeenCalled();
  });
});
