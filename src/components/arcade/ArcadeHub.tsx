"use client";
import { useState } from "react";
import { playSound } from "@/lib/sfx";
import { DEFRAG, type ArcadeGame } from "./arcadeGames";
import { AttractScreen } from "./AttractScreen";
import { ArcadeMachine } from "./ArcadeMachine";

const COMING_SOON = ["INVADERS.SYS", "CATCH.DLL", "SOLDER.BIN"];

export function ArcadeHub() {
  const [selected, setSelected] = useState<ArcadeGame | null>(null);
  const [origin, setOrigin] = useState<DOMRect | null>(null);

  if (selected) {
    return <ArcadeMachine game={selected} originRect={origin} onExitToWall={() => setSelected(null)} />;
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-16">
      <div aria-hidden className="mb-10 flex items-center gap-4">
        <span className="font-pixel bg-yellow px-2 py-1.5 text-[10px] text-[#1a1030]">★</span>
        <span className="glitch font-pixel text-sm text-cyan [text-shadow:0_0_12px_rgba(34,211,238,.5)] sm:text-base" data-text="ARCADE">
          ARCADE
        </span>
        <span className="h-0 flex-1 border-t-2 border-dashed border-purple/30" />
      </div>

      <p className="font-term mb-8 max-w-xl text-xl text-dim">
        A dim room of cabinets, humming. Step up and feed one a credit.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* DEFRAG cabinet - selecting it opens the maximized machine */}
        <button
          type="button"
          aria-label="Play DEFRAG.EXE"
          onClick={(e) => { playSound("confirm"); setOrigin(e.currentTarget.getBoundingClientRect()); setSelected(DEFRAG); }}
          className="gx-card pixel-corners flex flex-col overflow-hidden border-2 border-cyan/50 bg-bg2/70 text-left"
        >
          <div className="w-full border-b-2 border-cyan/40 bg-cyan/10 px-3 py-2">
            <span className="font-logo text-base text-cyan [text-shadow:0_0_10px_rgba(34,211,238,.6)]">DEFRAG.EXE</span>
          </div>
          <div className="h-28 w-full">
            <AttractScreen />
          </div>
          <div className="flex w-full items-center justify-between px-3 py-2.5">
            <span className="font-pixel text-[8px] text-dim">FIREWALL BREACH</span>
            <span className="font-pixel blink text-[8px] text-cyan">▶ SELECT</span>
          </div>
          <div aria-hidden className="mx-auto mb-2 h-1.5 w-10 rounded-sm bg-cyan/40 [box-shadow:0_0_10px_rgba(34,211,238,.6)]" />
        </button>

        {/* COMING SOON cabinets */}
        {COMING_SOON.map((name) => (
          <div
            key={name}
            className="pixel-corners relative flex flex-col overflow-hidden border-2 border-dim/20 bg-black/40 opacity-60"
          >
            <div className="border-b-2 border-dim/20 px-3 py-2">
              <span className="font-logo text-base text-dim">{name}</span>
            </div>
            <div aria-hidden className="h-28 w-full bg-[#05030d]" />
            <div className="px-3 py-2.5">
              <span className="font-pixel text-[8px] text-dim">OUT OF ORDER</span>
            </div>
            <span className="font-pixel absolute right-2 top-10 rotate-6 border border-pink/50 px-2 py-1 text-[7px] text-pink/80">
              MAINTENANCE
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
