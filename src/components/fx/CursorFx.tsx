"use client";
import { useEffect, useRef } from "react";
import { isReducedMotion } from "@/lib/motionPref";

const SCALE = 2;
const OUTLINE = "#050310";

/** Hollow pixel cursor shapes -- only the outline is drawn, interior stays transparent. */
const ARROW = [
  "#...........",
  "##..........",
  "###.........",
  "####........",
  "#####.......",
  "######......",
  "#######.....",
  "########....",
  "#########...",
  "##########..",
  "######......",
  "###.........",
  "###.........",
];

/** Trail emits from the cursor's foot, not the tip. */
const TRAIL_OFFSET = { x: 3, y: 22 };
const TRAIL_LIFE_MS = 340;

const CROSS = [
  "....#....",
  "....#....",
  "....#....",
  ".........",
  "###...###",
  ".........",
  "....#....",
  "....#....",
  "....#....",
];

/** Build a hollow pixel cursor as a data-URI `cursor` value with hotspot. */
function build(art: string[], stroke: string, hot: [number, number]): string {
  const pad = 1;
  const cols = Math.max(...art.map((r) => r.length));
  const W = cols + pad * 2;
  const H = art.length + pad * 2;
  const filled = (x: number, y: number) => {
    const r = art[y - pad];
    return !!r && r[x - pad] === "#";
  };
  const onEdge = (x: number, y: number) =>
    !filled(x + 1, y) || !filled(x - 1, y) || !filled(x, y + 1) || !filled(x, y - 1);
  let body = "";
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (filled(x, y)) continue;
      let adj = false;
      for (let dy = -1; dy <= 1 && !adj; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (filled(x + dx, y + dy)) { adj = true; break; }
        }
      }
      if (adj) body += `<rect x='${x}' y='${y}' width='1' height='1' fill='${OUTLINE}'/>`;
    }
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (filled(x, y) && onEdge(x, y)) {
        body += `<rect x='${x}' y='${y}' width='1' height='1' fill='${stroke}'/>`;
      }
    }
  }
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${W * SCALE}' height='${H * SCALE}'` +
    ` viewBox='0 0 ${W} ${H}' shape-rendering='crispEdges'>${body}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hot[0]} ${hot[1]}, auto`;
}

const TRAIL_COLORS = ["#22d3ee", "#ec4899", "#a855f7", "#fde047"];

/** Injects pixel cursors as CSS vars and renders a neon trail on fine pointers. */
export function CursorFx() {
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const root = document.documentElement.style;
    root.setProperty("--cur-arrow", build(ARROW, "#22d3ee", [2, 2]));
    root.setProperty("--cur-point", build(ARROW, "#fde047", [2, 2]));
    root.setProperty("--cur-aim", build(CROSS, "#22d3ee", [10, 10]));

    if (isReducedMotion()) return;

    let lx = -99;
    let ly = -99;
    let n = 0;
    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      if (dx * dx + dy * dy < 200) return;
      lx = e.clientX;
      ly = e.clientY;
      const host = trailRef.current;
      if (!host) return;
      const bit = document.createElement("span");
      bit.className = "trail-bit";
      bit.style.left = `${e.clientX + TRAIL_OFFSET.x}px`;
      bit.style.top = `${e.clientY + TRAIL_OFFSET.y}px`;
      const c = TRAIL_COLORS[n++ % TRAIL_COLORS.length];
      bit.style.background = c;
      bit.style.color = c; // drives the box-shadow glow
      host.appendChild(bit);
      window.setTimeout(() => bit.remove(), TRAIL_LIFE_MS);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return <div ref={trailRef} aria-hidden className="cursor-trail" />;
}
