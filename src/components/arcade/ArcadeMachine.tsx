"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ArcadeGame } from "./arcadeGames";
import { getHiScore, getBits } from "@/lib/defrag/meta";
import { isReducedMotion } from "@/lib/motionPref";
import { CabinetFrame, type CabinetButton } from "./CabinetFrame";
import { UpgradeTerminal } from "./UpgradeTerminal";
import { ArcadeSettings } from "./ArcadeSettings";

type Mode = "attract" | "terminal" | "settings" | "playing";

/**
 * The maximized arcade machine - a per-game hub. The cabinet screen shows the
 * active panel (attract / shop / settings); INSERT COIN boots into the game,
 * which takes over the full viewport with the cabinet hidden.
 */
export function ArcadeMachine({
  game,
  onExitToWall,
  originRect = null,
}: {
  game: ArcadeGame;
  onExitToWall(): void;
  originRect?: DOMRect | null;
}) {
  const [mode, setMode] = useState<Mode>("attract");
  const [booting, setBooting] = useState(false);
  const [hi, setHi] = useState(0);
  const [bits, setBits] = useState(0);
  const bootTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => { setHi(getHiScore()); setBits(getBits()); }, [mode]);
  useEffect(() => () => { if (bootTimer.current) clearTimeout(bootTimer.current); }, []);

  // FLIP: grow the machine out of the cabinet tile that was clicked.
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el || !originRect || isReducedMotion()) return;
    const final = el.getBoundingClientRect();
    if (!final.width || !final.height) return;
    const sx = originRect.width / final.width;
    const sy = originRect.height / final.height;
    const tx = originRect.left - final.left;
    const ty = originRect.top - final.top;
    el.style.transformOrigin = "top left";
    el.style.transform = `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`;
    el.style.opacity = "0.5";
    const raf = requestAnimationFrame(() => {
      el.style.transition = "transform 450ms cubic-bezier(.2,.7,.2,1), opacity 320ms ease-out";
      el.style.transform = "none";
      el.style.opacity = "1";
    });
    return () => cancelAnimationFrame(raf);
  }, [originRect]);

  const startGame = () => {
    if (isReducedMotion()) { setMode("playing"); return; }
    setBooting(true);
    bootTimer.current = setTimeout(() => { setBooting(false); setMode("playing"); }, 380);
  };

  // Fullscreen game - cabinet not rendered behind it.
  if (mode === "playing") {
    const Game = game.Game;
    return (
      <div className="fixed inset-0 z-[200] overflow-y-auto bg-bg">
        <Game onExit={() => setMode("attract")} onShop={game.hasShop ? () => setMode("terminal") : undefined} />
      </div>
    );
  }

  const Attract = game.Attract;
  let screen: React.ReactNode;
  if (booting) {
    screen = <div aria-hidden className="cab-boot h-full w-full bg-cyan/25" />;
  } else if (mode === "terminal") {
    screen = <UpgradeTerminal onExit={() => setMode("attract")} onPlay={startGame} />;
  } else if (mode === "settings") {
    screen = <ArcadeSettings />;
  } else {
    screen = (
      <div className="cab-crt-on relative h-full">
        <Attract />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-bg/60 px-3 py-2.5">
          <span className="font-pixel text-[8px] text-yellow">HI {hi.toLocaleString()}</span>
          <span className="font-pixel text-[8px] text-term">BITS {bits.toLocaleString()}</span>
        </div>
      </div>
    );
  }

  const buttons: CabinetButton[] = [
    { label: "▶ INSERT COIN", onClick: startGame, primary: true, tone: "cyan" },
    ...(game.hasShop ? [{ label: "TERMINAL", onClick: () => setMode("terminal"), tone: "yellow" as const }] : []),
    { label: "SETTINGS", onClick: () => setMode("settings"), tone: "dim" as const },
    {
      label: mode === "attract" ? "◀ EXIT" : "◀ BACK",
      onClick: () => (mode === "attract" ? onExitToWall() : setMode("attract")),
      tone: "pink" as const,
    },
  ];

  return (
    <section ref={rootRef} className="mx-auto w-full max-w-5xl px-5 py-10">
      <CabinetFrame title={game.title} accent={game.accent} led={mode === "attract" ? "green" : "amber"} buttons={buttons}>
        <div key={booting ? "boot" : mode} className="cab-panel-in h-full">
          {screen}
        </div>
      </CabinetFrame>
    </section>
  );
}
