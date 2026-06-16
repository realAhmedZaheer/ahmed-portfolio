"use client";
import { useEffect, useState } from "react";
import { isReducedMotion } from "@/lib/motionPref";
import { playSound } from "@/lib/sfx";
import { cn } from "@/lib/cn";

type Range = "7D" | "30D" | "90D";

const SERIES: Record<Range, number[]> = {
  "7D": [42, 51, 47, 63, 58, 71, 86, 79, 92, 88, 104, 118],
  "30D": [220, 245, 231, 268, 290, 274, 312, 330, 301, 348, 372, 401],
  "90D": [760, 802, 791, 845, 880, 921, 904, 968, 1010, 1043, 1102, 1180],
};

const KPIS: Record<Range, { mrr: number; users: number; p95: number }> = {
  "7D": { mrr: 18400, users: 1242, p95: 184 },
  "30D": { mrr: 21200, users: 4810, p95: 176 },
  "90D": { mrr: 26800, users: 12903, p95: 168 },
};

const EVENTS = [
  "◉ new signup - acme.dev",
  "▲ plan upgraded - PRO",
  "✚ export completed - 1.2GB",
  "◉ new signup - initech.io",
  "⚠ rate-limit warning - burst traffic",
  "▲ seat added - team of 14",
  "✚ webhook delivered - billing.sync",
  "◉ new signup - hooli.xyz",
];

/**
 * Live admin dashboard demo: animated KPIs, range-filtered bar chart, and a
 * streaming event feed - the $facet-rollup dashboard pattern, in miniature.
 * Illustrative data.
 */
export function DashboardDemo() {
  const [range, setRange] = useState<Range>("7D");
  const [shown, setShown] = useState(KPIS["7D"]);
  const [events, setEvents] = useState<string[]>(EVENTS.slice(0, 3));

  // animate KPI counters toward the active range's targets
  useEffect(() => {
    const target = KPIS[range];
    if (isReducedMotion()) {
      setShown(target);
      return;
    }
    let step = 0;
    const from = { ...shown };
    const iv = setInterval(() => {
      step++;
      const t = step / 10;
      if (step >= 10) {
        setShown(target);
        clearInterval(iv);
        return;
      }
      setShown({
        mrr: Math.round(from.mrr + (target.mrr - from.mrr) * t),
        users: Math.round(from.users + (target.users - from.users) * t),
        p95: Math.round(from.p95 + (target.p95 - from.p95) * t),
      });
    }, 45);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  // the live event feed
  useEffect(() => {
    if (isReducedMotion()) return;
    let i = 3;
    const iv = setInterval(() => {
      setEvents((prev) => [EVENTS[i++ % EVENTS.length], ...prev].slice(0, 5));
    }, 2200);
    return () => clearInterval(iv);
  }, []);

  const data = SERIES[range];
  const max = Math.max(...data);

  return (
    <div className="pixel-corners border-2 border-yellow/30 bg-[#0e0a06]/80 p-4 sm:p-5">
      <div className="font-pixel mb-4 flex flex-wrap items-center justify-between gap-2 text-[9px]">
        <span className="text-yellow">
          ▶ OPS DASHBOARD<span className="ml-2 text-dim">- illustrative data</span>
        </span>
        <span className="flex gap-1.5">
          {(Object.keys(SERIES) as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={range === r}
              onClick={() => {
                setRange(r);
                playSound("move");
              }}
              className={cn(
                "gx border px-2 py-1 text-[8px]",
                range === r
                  ? "border-yellow bg-yellow/15 text-yellow"
                  : "border-purple/40 text-dim hover:text-white",
              )}
            >
              {r}
            </button>
          ))}
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {(
          [
            ["MRR", `$${shown.mrr.toLocaleString()}`],
            ["ACTIVE USERS", shown.users.toLocaleString()],
            ["P95 LATENCY", `${shown.p95}ms`],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="border border-purple/40 bg-black/30 px-3 py-2.5 text-center">
            <div className="font-pixel text-[7px] text-dim">{label}</div>
            <div className="font-pixel mt-1.5 text-[11px] text-white sm:text-sm">{value}</div>
          </div>
        ))}
      </div>

      {/* bar chart */}
      <div className="mt-4 flex h-28 items-end gap-1.5 border-b-2 border-purple/30 pb-[2px]" aria-hidden>
        {data.map((v, i) => (
          <span
            key={i}
            className="flex-1 bg-gradient-to-t from-purple to-cyan transition-all duration-500 ease-out"
            style={{ height: `${Math.round((v / max) * 100)}%` }}
          />
        ))}
      </div>

      {/* live events */}
      <div className="mt-4">
        <p className="font-pixel mb-2 text-[7px] text-dim">LIVE EVENTS</p>
        <ul className="space-y-1">
          {events.map((e, i) => (
            <li
              key={`${e}-${i}`}
              className={cn("font-term text-base text-[#c8bff0]", i === 0 && "pop-in text-white")}
            >
              {e}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
