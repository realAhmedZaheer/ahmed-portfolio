"use client";
import { useEffect, useRef, useState } from "react";
import { isReducedMotion } from "@/lib/motionPref";
import { playSound } from "@/lib/sfx";
import { cn } from "@/lib/cn";

interface Exchange {
  id: string;
  user: string;
  tool?: string;
  reply: string;
}

const EXCHANGES: Exchange[] = [
  {
    id: "metrics",
    user: "How did signups trend this week?",
    tool: "get_metrics({ range: '7d' })",
    reply: "Signups are up 23% week over week - 412 new accounts, with Tuesday's launch post driving the spike. Want the cohort breakdown?",
  },
  {
    id: "summary",
    user: "Summarize the last support thread",
    reply: "The customer hit rate limits during a bulk import. I suggested batching at 50 req/min and linked the enterprise plan - they upgraded an hour later.",
  },
  {
    id: "draft",
    user: "Draft a release note for the new export API",
    reply: "**New: Export API** - pull your entire workspace as CSV or JSON with one call. Cursor pagination, 6k req/min on enterprise, and webhooks when the export is ready.",
  },
];

/**
 * Conversation-UX demo: streaming tokens, visible memory, in-line tool calls,
 * and a live context meter - the chat layer, isolated. Scripted replies,
 * real streaming mechanics. Reduced motion renders instantly.
 */
export function StreamChatDemo() {
  const [history, setHistory] = useState<{ role: "user" | "ai"; text: string; tool?: string }[]>([]);
  const [streaming, setStreaming] = useState<string | null>(null);
  const busyRef = useRef(false);

  const tokens = Math.round(
    (history.reduce((a, m) => a + m.text.length, 0) + (streaming?.length ?? 0)) / 4,
  );

  const ask = (ex: Exchange) => {
    if (busyRef.current) return;
    busyRef.current = true;
    playSound("confirm");
    setHistory((h) => [...h, { role: "user", text: ex.user }]);
    if (isReducedMotion()) {
      setHistory((h) => [...h, { role: "ai", text: ex.reply, tool: ex.tool }]);
      busyRef.current = false;
      return;
    }
    // stream the reply token-ish chunks at a time
    let i = 0;
    setStreaming("");
    const iv = setInterval(() => {
      i += 2 + Math.floor(Math.random() * 3);
      if (i >= ex.reply.length) {
        clearInterval(iv);
        setStreaming(null);
        setHistory((h) => [...h, { role: "ai", text: ex.reply, tool: ex.tool }]);
        busyRef.current = false;
        playSound("move");
      } else {
        setStreaming(ex.reply.slice(0, i));
      }
    }, 28);
  };

  // keep the scrollback pinned to the latest message
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el && typeof el.scrollTo === "function") {
      el.scrollTo({ top: el.scrollHeight });
    }
  }, [history, streaming]);

  return (
    <div className="pixel-corners border-2 border-cyan/30 bg-[#070d14]/85 p-4 sm:p-5">
      <div className="font-pixel mb-3 flex items-center justify-between text-[9px]">
        <span className="text-cyan">
          ▶ CHAT ENGINE<span className="ml-2 text-dim">- streaming + memory</span>
        </span>
        <span className="text-dim" aria-live="polite">
          CTX <span className="text-yellow">{tokens}</span> TOK
        </span>
      </div>

      {/* scrollback */}
      <div ref={scrollRef} className="h-56 space-y-3 overflow-y-auto border border-cyan/15 bg-black/30 p-3">
        {history.length === 0 && !streaming && (
          <p className="font-term text-lg text-dim">Pick a message below to start the conversation…</p>
        )}
        {history.map((m, i) => (
          <div key={i} className={cn("max-w-[85%]", m.role === "user" ? "ml-auto text-right" : "")}>
            {m.tool && (
              <p className="font-pixel mb-1 text-[7px] text-yellow">⚙ {m.tool}</p>
            )}
            <p
              className={cn(
                "font-term inline-block border px-3 py-2 text-lg leading-snug",
                m.role === "user"
                  ? "border-purple/50 bg-purple/15 text-white"
                  : "border-cyan/40 bg-cyan/10 text-[#d6f6ff]",
              )}
            >
              {m.text}
            </p>
          </div>
        ))}
        {streaming !== null && (
          <div className="max-w-[85%]">
            <p className="font-term inline-block border border-cyan/40 bg-cyan/10 px-3 py-2 text-lg leading-snug text-[#d6f6ff]">
              {streaming}
              <span className="blink ml-0.5 inline-block h-[1em] w-[0.5em] translate-y-0.5 bg-cyan align-baseline" />
            </p>
          </div>
        )}
      </div>

      {/* memory chips */}
      {history.length > 0 && (
        <div aria-hidden className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-pixel text-[7px] text-dim">MEMORY:</span>
          {["multi-turn history", "tool results cached", "tone: concise"].slice(0, Math.min(3, Math.ceil(history.length / 2))).map((m) => (
            <span key={m} className="font-pixel border border-purple/40 bg-purple/10 px-1.5 py-1 text-[7px] text-[#c8bff0]">
              {m}
            </span>
          ))}
        </div>
      )}

      {/* prompts */}
      <div className="mt-3 flex flex-wrap gap-2">
        {EXCHANGES.map((ex) => (
          <button
            key={ex.id}
            type="button"
            onClick={() => ask(ex)}
            className="gx border border-cyan/40 px-2 py-1 text-left font-term text-base text-[#a9e7f7] hover:bg-cyan/10"
          >
            {ex.user}
          </button>
        ))}
      </div>

      <p className="font-term mt-3 text-sm text-dim">
        Scripted replies, real streaming mechanics - token chunks, context meter, in-line tool calls.
      </p>
    </div>
  );
}
