import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GameHud } from "./GameHud";
import { BossBanner } from "./BossBanner";
import { initialState, reduce } from "@/lib/defrag/engine";

describe("GameHud", () => {
  it("shows throughput, sector, and powerup labels", () => {
    let s = reduce(initialState(), { type: "START", seed: 2 });
    s = { ...s, score: 12400, level: 4, charge: 100 };
    render(<GameHud state={s} />);
    expect(screen.getByText(/THR:/)).toBeInTheDocument();
    // the score reads from the aria-live status line (the visual odometer is decorative)
    expect(screen.getByText(/SECTOR 4 · THROUGHPUT 12400/)).toBeInTheDocument();
    expect(screen.getByText(/LINE LASER/)).toBeInTheDocument();
  });
});

describe("BossBanner", () => {
  it("names the boss and shows its HP percent", () => {
    const boss = { id: "gatekeeper", name: "GATEKEEPER.SYS", hp: 15, maxHp: 30, attackEveryMs: 12000 };
    render(<BossBanner boss={boss} voice={null} />);
    expect(screen.getByText(/GATEKEEPER\.SYS/)).toBeInTheDocument();
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });
});
