"use client";
import { useState } from "react";
import { InvadersGame } from "@/components/quest/forge/InvadersGame";
import { CatchGame } from "@/components/quest/forge/CatchGame";
import { SolderGame } from "@/components/quest/forge/SolderGame";

const GAMES = [InvadersGame, CatchGame, SolderGame];

interface ForgeMinigameProps {
  parts: string[];
  onComplete: () => void;
}

/** Picks a random forge minigame on mount; impossible to fail and skippable. */
export function ForgeMinigame({ parts, onComplete }: ForgeMinigameProps) {
  const [Game] = useState(() => GAMES[Math.floor(Math.random() * GAMES.length)]);
  return <Game parts={parts} onComplete={onComplete} />;
}
