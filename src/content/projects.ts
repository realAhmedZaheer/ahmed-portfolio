import type { WorkPillar } from "@/types/content";

export const pillars: WorkPillar[] = [
  {
    id: "agentic",
    gameName: "AGENTIC LLM SYSTEMS",
    label: "Work - Agentic LLM Systems",
    boss: {
      id: "command-center",
      demo: "agent-tool-call",
      title: "AI Command Center",
      summary:
        "A Gemini function-calling command center for admins: natural-language questions route to the right backend tool, with multi-turn context and shareable read-only result links.",
      metrics: [
        { label: "Agent tools", value: "30+" },
        { label: "Codebase", value: "~5k LOC" },
        { label: "Surfaces", value: "sales · users · security" },
      ],
    },
    cards: [
      {
        id: "roadmapper",
        title: "AI Roadmapper",
        blurb:
          "Gemini-powered roadmap generator with ranked filtering, role-aware difficulty mapping, response caching and cost controls.",
        tech: ["Gemini", "Caching", "Node"],
      },
      {
        id: "facet",
        title: "$facet Pipelines",
        blurb:
          "Multi-stage MongoDB aggregation pipelines powering financial, user-cohort and security analytics.",
        tech: ["MongoDB", "Aggregation"],
      },
      {
        id: "migrations",
        title: "LLM Migrations",
        blurb:
          "Model-version migrations across the codebase (OpenAI and Gemini) with regression tests and tool-call fixes.",
        tech: ["OpenAI", "Gemini"],
      },
      {
        id: "flashcards",
        title: "Flashcard Authoring",
        blurb:
          "Schema design, bulk upsert with duplicate-key race handling, JSON import and a flip-card player.",
        tech: ["MongoDB", "Next.js"],
      },
      {
        id: "isr",
        title: "ISR Cache Dashboard",
        blurb:
          "Next.js cache-revalidation dashboard with multi-URL parsing and per-path success/failure reporting.",
        tech: ["Next.js", "ISR"],
      },
      {
        id: "chat-reliability",
        title: "Chat Reliability",
        blurb:
          "Hardened a chat agent: trimmed history payloads, tool-call recovery, iteration limits and auth-token edge cases.",
        tech: ["Reliability"],
      },
    ],
  },
  {
    id: "genml",
    gameName: "GENERATIVE-ML INFRA",
    label: "Work - Generative-ML Infrastructure",
    boss: {
      id: "dataset-quality",
      demo: "scoring-pipeline",
      title: "Dataset Quality Analyzer",
      summary:
        "A multi-model quality analyzer for an internal ML training platform: each image runs through five vision models whose scores combine into one weighted quality metric used to filter training data.",
      metrics: [
        { label: "Scoring models", value: "5" },
        { label: "Codebase", value: "~1.2k LOC" },
        { label: "Inference", value: "concurrent batch" },
      ],
    },
    cards: [
      {
        id: "edit-dashboard",
        title: "Diffusion Edit Dashboard",
        blurb:
          "Variant-aware workflow templates and client-side node-graph rewiring for multi-image conditioning with real-time job status.",
        tech: ["TypeScript", "Diffusion"],
      },
      {
        id: "containers",
        title: "Containerized ML Infra",
        blurb:
          "NVIDIA CUDA + PyTorch, two-stage Docker builds separating 100GB+ model layers from app code.",
        tech: ["Docker", "CUDA"],
      },
      {
        id: "upload-pipeline",
        title: "Cross-Platform Uploads",
        blurb:
          "Next.js + Expo image upload with buffer validation, ReDoS-safe CORS middleware and memory-leak fixes.",
        tech: ["Next.js", "Expo"],
      },
    ],
  },
];
