import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UpgradeTerminal } from "./UpgradeTerminal";
import { addBits, getBits } from "@/lib/defrag/meta";

beforeEach(() => window.localStorage.clear());

describe("UpgradeTerminal", () => {
  it("shows the bits balance and the upgrade list", () => {
    addBits(500);
    render(<UpgradeTerminal onExit={() => {}} onPlay={() => {}} />);
    expect(screen.getByText(/TERMINAL SUPPLY/)).toBeInTheDocument();
    expect(screen.getByText(/500/)).toBeInTheDocument();
    expect(screen.getByText(/LOOKAHEAD\.CFG/)).toBeInTheDocument();
  });

  it("buys an affordable upgrade and debits bits", () => {
    addBits(150); // exactly enough for queue-plus (cheapest)
    render(<UpgradeTerminal onExit={() => {}} onPlay={() => {}} />);
    const buy = screen.getByRole("button", { name: /Buy USR\/PREFS\/LOOKAHEAD\.CFG/i });
    fireEvent.click(buy);
    expect(getBits()).toBe(0);
  });

  it("disables BUY when the player can't afford it", () => {
    addBits(10);
    render(<UpgradeTerminal onExit={() => {}} onPlay={() => {}} />);
    const buy = screen.getByRole("button", { name: /Buy USR\/PREFS\/LOOKAHEAD\.CFG/i });
    expect(buy).toBeDisabled();
  });
});
