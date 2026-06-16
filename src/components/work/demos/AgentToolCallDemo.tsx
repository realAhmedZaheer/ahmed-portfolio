"use client";
import { useState } from "react";
import type { Scenario } from "@/lib/agentDemo";
import { playSound } from "@/lib/sfx";
import { cn } from "@/lib/cn";

interface AgentResult {
  source: "gemini" | "illustrative";
  tool: string | null;
  args: Record<string, unknown> | null;
  result: string | null;
  reply: string;
  note?: string;
}

type Status = "idle" | "loading" | "done" | "error";

/** Interactive agent demo: visitor queries routed via Gemini function-calling. */
export function AgentToolCallDemo({ scenarios }: { scenarios: Scenario[] }) {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [res, setRes] = useState<AgentResult | null>(null);

  const run = async (raw: string) => {
    const q = raw.trim().slice(0, 200);
    if (!q || status === "loading") return;
    setPrompt(q);
    setStatus("loading");
    setRes(null);
    playSound("confirm");
    try {
      const r = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: q }),
      });
      const data = (await r.json()) as AgentResult & { error?: string };
      if (!r.ok || data.error) throw new Error(data.error ?? "request failed");
      setRes(data);
      setStatus("done");
      playSound("combo");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="pixel-corners border-2 border-term/30 bg-[#04100a]/85 p-4 font-term sm:p-5">
      <div className="font-pixel mb-3 text-[9px] text-term">
        ▶ AGENT CONSOLE
        <span className="ml-2 text-dim">- ask the admin agent</span>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {scenarios.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => run(s.prompt)}
            disabled={status === "loading"}
            className="gx border border-term/40 px-2 py-1 text-left text-base text-[#9fe8c8] hover:bg-term/10 disabled:opacity-50"
          >
            {s.prompt}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(prompt);
        }}
        className="flex gap-2"
      >
        <span className="font-term text-xl text-term">&gt;</span>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          maxLength={200}
          placeholder="…or type your own query"
          aria-label="Agent query"
          className="font-term flex-1 border-b border-term/30 bg-transparent text-xl text-[#eafff3] outline-none placeholder:text-dim/60"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="font-pixel gx border border-term/50 px-2 text-[8px] text-term hover:bg-term hover:text-[#04100a] disabled:opacity-50"
        >
          RUN ▶
        </button>
      </form>

      <div className="mt-4 min-h-[3rem] text-lg leading-relaxed">
        {status === "loading" && (
          <p className="text-term">
            routing<span className="blink">_</span>
          </p>
        )}
        {status === "error" && (
          <p className="text-pink">agent offline - try a preset query.</p>
        )}
        {status === "done" && res && (
          <div className="space-y-1.5">
            <p className="text-[#9fe8c8]">
              <span className="text-dim">prompt:</span> {prompt}
            </p>
            {res.tool ? (
              <>
                <p className="text-cyan">
                  → tool_call: <span className="text-white">{res.tool}</span>
                </p>
                <pre className="overflow-x-auto whitespace-pre-wrap text-base text-[#9fe8c8]">
                  {JSON.stringify(res.args ?? {}, null, 2)}
                </pre>
                <p className="text-[#9fe8c8]">
                  <span className="text-dim">← result:</span> {res.result}
                </p>
              </>
            ) : null}
            {res.reply ? <p className="text-[#eafff3]">{res.reply}</p> : null}
            <p
              className={cn(
                "font-pixel pt-1 text-[7px]",
                res.source === "gemini" ? "text-term" : "text-dim",
              )}
            >
              {res.source === "gemini"
                ? "▮ live · gemini function-calling"
                : "▮ illustrative routing"}
              {res.note ? ` · ${res.note}` : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
