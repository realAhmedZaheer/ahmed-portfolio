"use client";
import { useEffect, useRef, useState } from "react";
import { isReducedMotion } from "@/lib/motionPref";
import { playSound } from "@/lib/sfx";
import { cn } from "@/lib/cn";

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  latency: number;
  cache: "HIT" | "MISS";
  body: object;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/metrics?range=30d",
    latency: 42,
    cache: "HIT",
    body: {
      range: "30d",
      mrr: 21200,
      activeUsers: 4810,
      churn: 0.018,
      topPlan: "PRO",
    },
  },
  {
    method: "POST",
    path: "/api/roadmap/generate",
    latency: 318,
    cache: "MISS",
    body: {
      id: "rm_8f2c1",
      role: "ml-engineer",
      weeks: 12,
      items: ["transformers deep-dive", "eval harnesses", "serving & quantization"],
      cached_until: "2026-07-12T00:00:00Z",
    },
  },
  {
    method: "GET",
    path: "/api/security/impossible-travel?window=7d",
    latency: 87,
    cache: "MISS",
    body: {
      window: "7d",
      flagged: 3,
      accounts: [
        { id: "u_4421", jump: "MEL → FRA in 41min", verdict: "blocked" },
        { id: "u_9013", jump: "SYD → SFO in 2h", verdict: "review" },
      ],
    },
  },
];

type Phase = "idle" | "loading" | "typing" | "done";

/**
 * API playground demo: pick an endpoint, watch the typed response arrive with
 * latency, cache and rate-limit signals - the contract made visible.
 * Canned responses, illustrative data.
 */
export function ApiPlaygroundDemo() {
  const [sel, setSel] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [shown, setShown] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const call = (i: number) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setSel(i);
    playSound("confirm");
    const full = JSON.stringify(ENDPOINTS[i].body, null, 2);
    if (isReducedMotion()) {
      setShown(full);
      setPhase("done");
      return;
    }
    setPhase("loading");
    setShown("");
    timers.current.push(
      setTimeout(() => {
        setPhase("typing");
        let n = 0;
        const iv = setInterval(() => {
          n += 26;
          if (n >= full.length) {
            clearInterval(iv);
            setShown(full);
            setPhase("done");
            playSound("move");
          } else {
            setShown(full.slice(0, n));
          }
        }, 24);
      }, 320),
    );
  };

  const e = sel !== null ? ENDPOINTS[sel] : null;

  return (
    <div className="pixel-corners border-2 border-term/30 bg-[#04100a]/85 p-4 font-term sm:p-5">
      <div className="font-pixel mb-3 text-[9px] text-term">
        ▶ API PLAYGROUND
        <span className="ml-2 text-dim">- hit an endpoint</span>
      </div>

      {/* endpoints */}
      <div className="space-y-1.5">
        {ENDPOINTS.map((ep, i) => (
          <button
            key={ep.path}
            type="button"
            aria-pressed={sel === i}
            onClick={() => call(i)}
            className={cn(
              "gx-row flex w-full items-center gap-3 border px-3 py-2 text-left",
              sel === i ? "border-term bg-term/10" : "border-term/30 hover:bg-term/5",
            )}
          >
            <span
              className={cn(
                "font-pixel w-10 shrink-0 text-[8px]",
                ep.method === "GET" ? "text-cyan" : "text-yellow",
              )}
            >
              {ep.method}
            </span>
            <span className="truncate text-lg text-[#9fe8c8]">{ep.path}</span>
          </button>
        ))}
      </div>

      {/* response */}
      <div className="mt-4 min-h-[7rem]">
        {phase === "loading" && (
          <p className="text-lg text-term">
            ⇡ request sent<span className="blink">_</span>
          </p>
        )}
        {(phase === "typing" || phase === "done") && e && (
          <div>
            <div className="font-pixel mb-2 flex flex-wrap gap-2 text-[7px]" aria-hidden>
              <span className="border border-term/60 px-1.5 py-1 text-term">200 OK</span>
              <span className="border border-cyan/50 px-1.5 py-1 text-cyan">{e.latency}ms</span>
              <span
                className={cn(
                  "border px-1.5 py-1",
                  e.cache === "HIT" ? "border-yellow/60 text-yellow" : "border-dim/50 text-dim",
                )}
              >
                CACHE {e.cache}
              </span>
              <span className="border border-purple/50 px-1.5 py-1 text-[#c8bff0]">RL 58/60</span>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap border border-term/20 bg-black/40 p-3 text-base leading-snug text-[#bdf5d9]">
              {shown}
              {phase === "typing" && <span className="blink inline-block h-[1em] w-[0.5em] translate-y-0.5 bg-term align-baseline" />}
            </pre>
          </div>
        )}
        {phase === "idle" && (
          <p className="text-lg text-dim">Responses are canned and illustrative - the contract is the point.</p>
        )}
      </div>
    </div>
  );
}
