/** Demos available to the quest forge - the two resume demos plus the
    specialization showpieces under src/components/quest/demos/. */
export type QuestDemoKind =
  | "agent-tool-call"
  | "scoring-pipeline"
  | "rag-retrieval"
  | "stream-chat"
  | "worker-orchestrator"
  | "dashboard"
  | "api-playground";

export interface QuestSub {
  id: string;
  label: string;
  sub: string;
  /** Component chips riding the invaders in the forge minigame. */
  parts: string[];
  /** BUILD SPEC - what the forged demo itself shows and how it works. */
  spec: string[];
  demo: QuestDemoKind;
}

export interface QuestCategory {
  id: string;
  label: string;
  sub: string;
  /** A single sub means the secondary screen is skipped. */
  subs: QuestSub[];
}

export const questCategories: QuestCategory[] = [
  {
    id: "agentic",
    label: "AGENTIC AI · LLM SYSTEMS",
    sub: "tool-calling agents, chat, LLM features",
    subs: [
      {
        id: "tool-agent",
        label: "TOOL-CALLING AGENT",
        sub: "an AI that runs real operations",
        parts: ["GEMINI", "TOOL-CALLS", "FUNCTIONS", "MONGO", "GUARDRAILS", "EVALS"],
        spec: [
          "A live agent: your prompt goes to Gemini, which decides which ops tool to call - the routing, arguments and reply are real; the tool results are illustrative.",
          "Watch the tool_call line - that's function-calling choosing between revenue rollups, fraud scans and content checks.",
          "If the model is unreachable it falls back to canned routing - agents should degrade, not die.",
        ],
        demo: "agent-tool-call",
      },
      {
        id: "rag",
        label: "RAG · KNOWLEDGE RETRIEVAL",
        sub: "answers grounded in your docs",
        parts: ["CHUNKER", "EMBEDDINGS", "VECTOR-DB", "RERANKER", "GEMINI", "CITATIONS"],
        spec: [
          "Ask anything: the corpus is ranked live against your query - token-overlap scoring stands in for embeddings - and the top chunks are retrieved.",
          "The answer is assembled only from retrieved chunks and cites them; no confident match means it says so instead of guessing.",
          "A production build swaps in real embeddings, a vector store and a reranker behind the same pipeline.",
        ],
        demo: "rag-retrieval",
      },
      {
        id: "chat",
        label: "CHAT · CONVERSATION UX",
        sub: "streaming, memory, tool use in-line",
        parts: ["STREAMING", "MEMORY", "TOKENS", "TOOL-USE", "FIREBASE", "UX"],
        spec: [
          "Replies stream in token chunks with a blinking cursor, a live context meter, and conversation memory you can see.",
          "One reply routes through an in-line tool call - the ⚙ badge - before it answers.",
          "The mechanics are real (chunked streaming, history state); the replies are scripted so it runs without an API key.",
        ],
        demo: "stream-chat",
      },
    ],
  },
  {
    id: "ml-infra",
    label: "ML · DATA PIPELINES",
    sub: "vision models, scoring, GPU infrastructure",
    subs: [
      {
        id: "scoring",
        label: "DATA QUALITY · SCORING",
        sub: "multi-model pipelines that grade data",
        parts: ["SIGLIP", "DETR", "SHARPNESS", "DEDUP", "WEIGHTS", "BATCHING"],
        spec: [
          "Pick a sample: five model stages score it, and a weighted fusion turns them into one number with a PASS / REVIEW / REJECT verdict.",
          "The weights matter - sharpness and uniqueness count double, mirroring how image datasets actually fail.",
          "A production build runs the same shape with real inference and concurrent batching.",
        ],
        demo: "scoring-pipeline",
      },
      {
        id: "orchestration",
        label: "JOB ORCHESTRATION · GPU WORKERS",
        sub: "queues that heal themselves",
        parts: ["NESTJS", "BULLMQ", "CUDA", "RETRIES", "BACKOFF", "DOCKER"],
        spec: [
          "Three GPU workers drain a training-job queue with live progress - go ahead, ☠ KILL one mid-job.",
          "The orphaned job re-queues with exponential backoff while the dead worker respawns; the pool heals itself.",
          "+ ADD JOB piles on pressure - the scheduler just keeps assigning.",
        ],
        demo: "worker-orchestrator",
      },
      {
        id: "metrics",
        label: "REALTIME METRICS · OBSERVABILITY",
        sub: "see the system breathe",
        parts: ["KPIS", "CHARTS", "EVENTS", "$FACET", "ALERTS", "SWR"],
        spec: [
          "KPIs animate to each range, the chart re-filters, and the event feed keeps streaming - the whole surface stays live.",
          "Flip 7D / 30D / 90D and watch every number reconcile in one motion.",
          "Illustrative data; a production build feeds the same surface from aggregation rollups.",
        ],
        demo: "dashboard",
      },
    ],
  },
  {
    id: "fullstack",
    label: "FULL-STACK PRODUCT",
    sub: "web apps, APIs, data - end to end",
    subs: [
      {
        id: "dashboard",
        label: "ADMIN DASHBOARD · ANALYTICS",
        sub: "ops tools your team lives in",
        parts: ["NEXT.JS", "CHARTS", "$FACET", "FILTERS", "EXPORTS", "RBAC"],
        spec: [
          "An ops surface in miniature: animated KPIs, a range-filtered chart and a live event feed on one screen.",
          "Every control answers instantly - admin tools should feel faster than the product they manage.",
          "Illustrative data; production versions sit on real aggregation pipelines behind role-based access.",
        ],
        demo: "dashboard",
      },
      {
        id: "api",
        label: "APIs · BACKEND SYSTEMS",
        sub: "endpoints with contracts and teeth",
        parts: ["REST", "SCHEMAS", "REDIS", "RATE-LIMITS", "CACHE", "AUTH"],
        spec: [
          "Pick an endpoint and the response types out under its contract badges: status, latency, cache HIT/MISS, rate-limit budget.",
          "Three shapes on purpose: a cached metrics read, an expensive generated POST, and a security scan with verdicts.",
          "Responses are canned - the contract made visible is the point.",
        ],
        demo: "api-playground",
      },
      {
        id: "ai-features",
        label: "AI-POWERED PRODUCT FEATURES",
        sub: "ship the model inside the product",
        parts: ["GEMINI", "NEXT.JS", "STREAMING", "CACHING", "LIMITS", "UX"],
        spec: [
          "A real model call routed through a product surface - prompt in, tool routing, grounded reply out.",
          "Try it with the presets or your own words; the same console copes with no API key by falling back to illustrative routing.",
          "Integration is the feature: caching, limits and graceful failure decide whether AI features survive contact with users.",
        ],
        demo: "agent-tool-call",
      },
    ],
  },
  {
    id: "unsure",
    label: "NOT SURE YET · SURPRISE ME",
    sub: "show me the highlights",
    subs: [
      {
        id: "highlights",
        label: "THE HIGHLIGHT REEL",
        sub: "a bit of everything",
        parts: ["AI", "FULL-STACK", "GPU", "CLOUD", "MOBILE", "COFFEE"],
        spec: [
          "The live agent console - a real Gemini call deciding which tool to run on your question.",
          "Poke around the rest too: every screen on this site is part of the demo, from the chiptune engine to the CRT boot.",
          "The fastest spec is a conversation - CONTINUE? is one click away.",
        ],
        demo: "agent-tool-call",
      },
    ],
  },
];
