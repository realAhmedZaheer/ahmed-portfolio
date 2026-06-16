"use client";
import { useEffect, useReducer, useRef, useState } from "react";
import { reduce, initialState } from "@/lib/defrag/engine";
import { dropIntervalMs } from "@/lib/defrag/scoring";
import { applyUpgrades } from "@/lib/defrag/meta";
import { addBits, setHiScore, getHiScore } from "@/lib/defrag/meta";
import { defragSound } from "@/lib/defrag/audio";
import { getMusic, type MusicAction } from "@/lib/defrag/music";
import {
  bossVoiceFor, BOSS_SPAWN_LINE, BOSS_ATTACK_LINE, BOSS_DEFEAT_LINE, BOSS_TOPOUT_LINE,
} from "@/lib/defrag/bosses";
import { DEFAULT_CONFIG, ROWS, BUFFER, VISIBLE_ROWS } from "@/lib/defrag/types";
import type { Board, GameEventTag } from "@/lib/defrag/types";
import { unlock } from "@/lib/achievements";
import { isReducedMotion } from "@/lib/motionPref";
import { unlockAudio } from "@/lib/sfx";
import { useIsMobile } from "@/lib/useIsMobile";
import { BackgroundFx, type BgPulseKind } from "./BackgroundFx";
import { Playfield } from "./Playfield";
import { GameHud } from "./GameHud";
import { BossBanner } from "./BossBanner";
import { PauseOverlay } from "./PauseOverlay";
import { RunOverScreen } from "./RunOverScreen";
import { TouchControls } from "./TouchControls";
import { TouchGuide } from "./TouchGuide";
import { useTouchControls } from "./useTouchControls";

const LOCK_DELAY = 500;
const ATTACK_WARN = 1500;

/** Topmost filled visible row → danger 0..1 (1 = stack near the top). */
function dangerFromBoard(board: Board): number {
  for (let r = BUFFER; r < ROWS; r++) {
    if (board[r].some((c) => c !== null)) {
      const fromTop = r - BUFFER;
      return Math.max(0, Math.min(1, (VISIBLE_ROWS - fromTop) / VISIBLE_ROWS));
    }
  }
  return 0;
}

/** Map a one-shot game event to its DEFRAG sound. */
function soundFor(ev: GameEventTag | null, lines: number): void {
  switch (ev) {
    case "rotate": defragSound("rotate"); break;
    case "hold": defragSound("hold"); break;
    case "powerup": defragSound("powerup"); break;
    case "bossattack": defragSound("garbage"); break;
    case "overflow": defragSound("overflow"); defragSound("bosshit"); break;
    case "lock":
      defragSound("lock");
      if (lines === 1) defragSound("clear1");
      else if (lines === 2) defragSound("clear2");
      else if (lines === 3) { defragSound("clear3"); defragSound("bosshit"); }
      break;
  }
}

/** Map a play event to the background's world reaction (null = no world pulse). */
function bgPulseFor(ev: GameEventTag | null, lc: { isOverflow: boolean; crit?: boolean } | null): BgPulseKind | null {
  if (lc?.crit) return "crit";
  if (lc?.isOverflow) return "overflow";
  if (lc) return "clear";
  if (ev === "bossattack") return "harddrop";
  if (ev === "lock") return "lock";
  return null;
}

/** Map a play event to a musical chord trigger (null = no note). */
function musicActionFor(ev: GameEventTag | null, lc: { isOverflow: boolean } | null): MusicAction | null {
  if (lc?.isOverflow) return "overflow";
  if (lc) return "clear";
  if (ev === "lock") return "lock";
  if (ev === "rotate") return "rotate";
  if (ev === "move") return "move";
  if (ev === "hold") return "hold";
  if (ev === "bossattack") return "harddrop";
  return null;
}

export function DefragGame({ onExit, onShop }: { onExit(): void; onShop?(): void }) {
  const [state, dispatch] = useReducer(reduce, undefined, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const [voice, setVoice] = useState<string | null>(null);
  const voiceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const musicEnergy = useRef(0);
  const endHandled = useRef(false);
  const overTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [highScore, setHighScore] = useState(false);
  const [overVisible, setOverVisible] = useState(false);
  const [bombReady, setBombReady] = useState(false);
  const bombTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pulse, setPulse] = useState<{ kind: BgPulseKind; at: number; x?: number } | null>(null);
  const pulseSeq = useRef(0);
  const breathUntil = useRef(0);

  const isMobile = useIsMobile();
  const playfieldRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  useTouchControls({ enabled: isMobile, surfaceRef, playfieldRef, dispatch });

  const flashVoice = (line: string, ms = 1800) => {
    setVoice(line);
    if (voiceTimer.current) clearTimeout(voiceTimer.current);
    voiceTimer.current = setTimeout(() => setVoice(null), ms);
  };

  /** Dispatch START with owned upgrades applied; announce BOMB READY if armed. */
  const startRun = (seed: number) => {
    const cfg = applyUpgrades(DEFAULT_CONFIG);
    dispatch({ type: "START", seed, config: cfg });
    getMusic().start();
    flashVoice(BOSS_SPAWN_LINE, 2200);
    if (cfg.startCharge >= 100) {
      setBombReady(true);
      defragSound("powerup");
      if (bombTimer.current) clearTimeout(bombTimer.current);
      bombTimer.current = setTimeout(() => setBombReady(false), 1000);
    }
  };

  // Start the run on mount.
  useEffect(() => {
    unlockAudio();
    unlock("defrag-first");
    startRun(Date.now() & 0x7fffffff);
    return () => {
      getMusic().stop();
      if (voiceTimer.current) clearTimeout(voiceTimer.current);
      if (bombTimer.current) clearTimeout(bombTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Game loop: gravity, lock delay, boss attack timing.
  useEffect(() => {
    let raf = 0;
    let last = 0;
    let grav = 0;
    let groundedAt = 0;
    let attackClock = 0;
    let warnAt = 0;

    const loop = (now: number) => {
      if (!last) last = now;
      const dt = now - last;
      last = now;
      const s = stateRef.current;

      if (s.phase === "playing") {
        // a brief "breath" after a Tetris - gravity eases off so the bloom lands
        const breath = now < breathUntil.current ? 1 + 1.2 * ((breathUntil.current - now) / 1200) : 1;
        const interval = dropIntervalMs(s.level, s.config.gravityScale) * (s.slowTicks > 0 ? 2 : 1) * breath;
        grav += dt;
        if (grav >= interval) { grav = 0; dispatch({ type: "TICK" }); }

        // escalate the music bed: level + danger + recent-clear energy
        musicEnergy.current = Math.max(0, musicEnergy.current - dt * 0.0004);
        const dng = dangerFromBoard(s.board);
        getMusic().setIntensityTarget(0.15 + Math.min(0.5, s.level * 0.05) + dng * 0.35 + musicEnergy.current);

        if (s.grounded) {
          if (!groundedAt) groundedAt = now;
          else if (now - groundedAt > LOCK_DELAY) { groundedAt = 0; dispatch({ type: "LOCK" }); }
        } else {
          groundedAt = 0;
        }

        // boss attack telegraph → injection
        if (!warnAt) {
          attackClock += dt;
          if (attackClock >= s.boss.attackEveryMs) {
            warnAt = now;
            attackClock = 0;
            defragSound("bosswarn");
            flashVoice(BOSS_ATTACK_LINE, ATTACK_WARN);
          }
        } else if (now - warnAt > ATTACK_WARN) {
          warnAt = 0;
          dispatch({ type: "BOSS_ATTACK" });
        }
      } else {
        groundedAt = 0;
        warnAt = 0;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Input.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const k = e.key;
      if ((k === "Escape" || k === "p" || k === "P") && s.phase === "playing") {
        e.preventDefault(); e.stopPropagation();
        dispatch({ type: "PAUSE" });
        return;
      }
      if (s.phase !== "playing") return;
      switch (k) {
        case "ArrowLeft": case "a": case "A": e.preventDefault(); dispatch({ type: "MOVE", dir: -1 }); break;
        case "ArrowRight": case "d": case "D": e.preventDefault(); dispatch({ type: "MOVE", dir: 1 }); break;
        case "ArrowDown": case "s": case "S": e.preventDefault(); dispatch({ type: "SOFT_DROP" }); break;
        case "ArrowUp": case "w": case "W": e.preventDefault(); dispatch({ type: "ROTATE", dir: 1 }); break;
        case "z": case "Z": case "q": case "Q": e.preventDefault(); dispatch({ type: "ROTATE", dir: -1 }); break;
        case " ": e.preventDefault(); dispatch({ type: "HARD_DROP" }); break;
        case "Shift": case "c": case "C": e.preventDefault(); dispatch({ type: "HOLD" }); break;
        case "1": dispatch({ type: "USE_POWERUP", id: "laser" }); break;
        case "2": dispatch({ type: "USE_POWERUP", id: "slow" }); break;
        case "3": dispatch({ type: "USE_POWERUP", id: "bomb" }); break;
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  // Event reactions: audio, achievements, boss voice thresholds.
  useEffect(() => {
    if (state.lastClear?.crit) defragSound("anomaly");
    else soundFor(state.event, state.lastClear?.lines ?? 0);
    if (state.event === "overflow") unlock("defrag-overflow");
    if (state.event === "lock" && state.lastClear) {
      const frac = state.boss.hp / state.boss.maxHp;
      if (frac <= 0.25 || frac <= 0.5) flashVoice(bossVoiceFor(frac), 1500);
    }
    // drive the reactive world + the post-Tetris "breath"
    const kind = bgPulseFor(state.event, state.lastClear);
    if (kind) setPulse({ kind, at: ++pulseSeq.current, x: state.lockX });
    if (state.lastClear?.isOverflow) breathUntil.current = performance.now() + 1200;
    // musical chord (quantized to the beat) + escalate the bed on a clear
    const act = musicActionFor(state.event, state.lastClear);
    if (act) getMusic().trigger(act);
    if (state.lastClear) musicEnergy.current = Math.min(0.5, musicEnergy.current + 0.25);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.event, state.lastClear]);

  const danger = dangerFromBoard(state.board);

  // Run end: award bits + high score once, play the finale.
  useEffect(() => {
    if ((state.phase === "over" || state.phase === "won") && !endHandled.current) {
      endHandled.current = true;
      getMusic().stop();
      const isHi = state.score > getHiScore();
      setHighScore(isHi);
      const bits = Math.round(state.score / 100) + Math.round((1 - state.boss.hp / state.boss.maxHp) * 40);
      addBits(bits);
      setHiScore(state.score);
      if (state.phase === "won") {
        unlock("defrag-boss");
        flashVoice(BOSS_DEFEAT_LINE, 3000);
        defragSound("overflow");
        // let the sigil shatter + finale beat play before the panel covers it
        overTimer.current = setTimeout(() => setOverVisible(true), 900);
      } else {
        flashVoice(BOSS_TOPOUT_LINE, 3000);
        defragSound("explode");
        defragSound("gameover");
        if (isReducedMotion()) {
          setOverVisible(true);
        } else {
          // SYSTEM FAILURE: shatter + background blast, then the panel
          setPulse({ kind: "fail", at: ++pulseSeq.current, x: state.lockX });
          overTimer.current = setTimeout(() => setOverVisible(true), 1200);
        }
      }
    }
  }, [state.phase, state.score, state.boss.hp, state.boss.maxHp]);

  // Clean up the finale timer on unmount.
  useEffect(() => () => { if (overTimer.current) clearTimeout(overTimer.current); }, []);

  const retry = () => {
    endHandled.current = false;
    setHighScore(false);
    setOverVisible(false);
    if (overTimer.current) clearTimeout(overTimer.current);
    startRun((Date.now() & 0x7fffffff) ^ 0x55);
  };

  const bits = Math.round(state.score / 100) + Math.round((1 - state.boss.hp / state.boss.maxHp) * 40);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
      <BackgroundFx danger={danger} level={state.level} pulse={pulse} />
      <div aria-hidden className="crt-overlay" />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center px-3 pt-4 pb-24 sm:pb-4">
        <div className="w-full max-w-sm">
          <BossBanner boss={state.boss} voice={voice} />
        </div>
        <div className="mt-4 flex w-full flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center">
          <div
            ref={playfieldRef}
            className="relative aspect-[1/2] h-[68vh] max-h-[780px] border-2 border-purple/40 bg-black/40 sm:h-[82vh]"
          >
            <Playfield state={state} />
          </div>
          <GameHud state={state} bombReady={bombReady} />
        </div>
      </div>

      {isMobile && (
        <>
          <div ref={surfaceRef} aria-hidden className="absolute inset-0 z-20 [touch-action:none]" />
          <div className="absolute inset-x-0 bottom-0 z-[25] px-2 pb-3">
            <TouchControls charge={state.charge} dispatch={dispatch} />
          </div>
          {state.phase === "playing" && <TouchGuide />}
        </>
      )}

      {state.phase === "paused" && (
        <PauseOverlay onResume={() => dispatch({ type: "RESUME" })} onExit={onExit} />
      )}
      {(state.phase === "over" || state.phase === "won") && overVisible && (
        <RunOverScreen
          kind={state.phase}
          score={state.score}
          level={state.level}
          lines={state.lines}
          bits={bits}
          isHighScore={highScore}
          onPrimary={state.phase === "won" ? onExit : retry}
          onExit={onExit}
          onShop={onShop}
        />
      )}
    </div>
  );
}
