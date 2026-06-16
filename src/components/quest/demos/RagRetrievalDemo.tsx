"use client";
import { useState } from "react";
import { rankDocs, type RagDoc } from "@/lib/ragDemo";
import { playSound } from "@/lib/sfx";
import { cn } from "@/lib/cn";

/** Illustrative corpus - a tiny "support docs" knowledge base. */
const CORPUS: RagDoc[] = [
  { id: "refunds", title: "Refund policy", text: "Customers can request a full refund within 30 days of purchase via the billing portal." },
  { id: "sso", title: "Enterprise SSO setup", text: "Configure SAML single sign-on with Okta or Azure AD from the security settings page." },
  { id: "limits", title: "API rate limits", text: "Free plans allow 60 requests per minute; enterprise plans raise the API rate limit to 6000." },
  { id: "export", title: "Exporting your data", text: "Export all workspace data as CSV or JSON from the admin export panel." },
  { id: "billing", title: "Changing your plan", text: "Upgrade, downgrade or cancel your subscription plan anytime from billing." },
  { id: "uptime", title: "Status & uptime", text: "Service status, incident history and uptime SLAs are published on the status page." },
];

const PRESETS = [
  "can I get a refund on my purchase?",
  "can we set up single sign-on with Okta?",
  "what are the API rate limits on the free plan?",
];

const STAGES = ["QUERY", "EMBED", "SEARCH", "RERANK", "ANSWER"];

/** RAG retrieval demo with token-overlap ranking over an illustrative corpus. */
export function RagRetrievalDemo() {
  const [query, setQuery] = useState("");
  const [ran, setRan] = useState<string | null>(null);

  const results = ran ? rankDocs(ran, CORPUS) : null;
  const retrieved = results?.filter((r) => r.score > 0.3).slice(0, 3) ?? [];

  const run = (q: string) => {
    const clean = q.trim().slice(0, 120);
    if (!clean) return;
    setQuery(clean);
    setRan(clean);
    playSound("confirm");
  };

  return (
    <div className="pixel-corners border-2 border-purple/40 bg-[#0a0616]/80 p-4 sm:p-5">
      <div className="font-pixel mb-3 text-[9px] text-cyan">
        ▶ RAG RETRIEVAL
        <span className="ml-2 text-dim">- ask the knowledge base</span>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => run(p)}
            className="gx border border-purple/50 px-2 py-1 text-left font-term text-base text-[#c8bff0] hover:bg-purple/15"
          >
            {p}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(query);
        }}
        className="flex gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          maxLength={120}
          placeholder="…or ask your own question"
          aria-label="Knowledge base query"
          className="font-term flex-1 border-b border-purple/40 bg-transparent text-xl text-white outline-none placeholder:text-dim/60 focus:border-cyan"
        />
        <button
          type="submit"
          className="font-pixel gx border border-cyan/50 px-2 text-[8px] text-cyan hover:bg-cyan hover:text-bg"
        >
          RETRIEVE ▶
        </button>
      </form>

      {results && (
        <div className="mt-5">
          <div aria-hidden className="mb-4 flex flex-wrap items-center gap-2">
            {STAGES.map((s, i) => (
              <span key={s} className="flex items-center gap-2">
                <span
                  className="pop-in font-pixel border border-term/50 bg-term/10 px-1.5 py-1 text-[7px] text-term"
                  style={{ animationDelay: `${i * 160}ms` }}
                >
                  {s}
                </span>
                {i < STAGES.length - 1 && <span className="text-dim">→</span>}
              </span>
            ))}
          </div>

          <ul className="space-y-2">
            {results.map(({ doc, score }) => {
              const hit = retrieved.some((r) => r.doc.id === doc.id);
              return (
                <li key={doc.id} className="flex items-center gap-3">
                  <span className={cn("font-term w-44 shrink-0 truncate text-base", hit ? "text-white" : "text-dim")}>
                    {doc.title}
                  </span>
                  <span className="h-2.5 flex-1 border border-purple/40 bg-black/40 p-[2px]">
                    <span
                      className={cn(
                        "block h-full transition-[width] duration-700 ease-out",
                        hit ? "bg-gradient-to-r from-cyan to-term" : "bg-purple/40",
                      )}
                      style={{ width: `${Math.round(score * 100)}%` }}
                    />
                  </span>
                  <span className="font-pixel w-7 shrink-0 text-right text-[8px] text-cyan">
                    {Math.round(score * 100)}
                  </span>
                  <span
                    className={cn(
                      "font-pixel w-20 shrink-0 text-[7px]",
                      hit ? "text-term" : "text-dim/50",
                    )}
                  >
                    {hit ? "▶ RETRIEVED" : "skipped"}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="pop-in mt-4 border-l-2 border-term/60 bg-term/5 p-3" style={{ animationDelay: "800ms" }}>
            <p className="font-pixel mb-1.5 text-[8px] text-term">GROUNDED ANSWER</p>
            {retrieved.length > 0 ? (
              <p className="font-term text-lg leading-snug text-[#d8f5e6]">
                {retrieved[0].doc.text}{" "}
                <span className="text-dim">
                  {retrieved.map((_, i) => `[${i + 1}]`).join(" ")} - sources:{" "}
                  {retrieved.map((r) => r.doc.title).join(" · ")}
                </span>
              </p>
            ) : (
              <p className="font-term text-lg text-dim">
                No confident match - a production system would say so instead of guessing.
              </p>
            )}
          </div>
        </div>
      )}

      <p className="font-term mt-3 text-sm text-dim">
        Token-overlap scoring stands in for embeddings - illustrative corpus, real ranking math.
      </p>
    </div>
  );
}
