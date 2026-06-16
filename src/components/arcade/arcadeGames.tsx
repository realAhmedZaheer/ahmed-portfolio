import type { ComponentType } from "react";
import { DefragGame } from "./DefragGame";
import { AttractScreen } from "./AttractScreen";

/** A cabinet the arcade can host: its title, signature color, attract visual,
    the game component, and whether it has an upgrade shop. */
export interface ArcadeGame {
  id: string;
  title: string;
  accent: string;
  Attract: ComponentType;
  Game: ComponentType<{ onExit(): void; onShop?(): void }>;
  hasShop: boolean;
}

export const DEFRAG: ArcadeGame = {
  id: "defrag",
  title: "DEFRAG.EXE",
  accent: "#22d3ee",
  Attract: AttractScreen,
  Game: DefragGame,
  hasShop: true,
};
