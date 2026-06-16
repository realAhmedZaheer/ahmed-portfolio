import type { ExperienceEntry } from "@/types/content";

export const experience: ExperienceEntry[] = [
  {
    org: "DesignGurus",
    role: "AI/ML Engineer",
    period: "2025 - Present",
    kind: "main",
    bullets: [
      "Built a multi-model dataset quality analyzer (Xenova: SigLIP, DETR, sharpness, dedup, face clustering) with weighted multi-metric scoring.",
      "Engineered an image-editing dashboard for diffusion workflows with client-side node-graph rewiring and real-time job tracking.",
      "Built a GPU-accelerated NestJS worker orchestration layer - self-healing retries, bulkWrite optimization (N queries → one batched update).",
      "Co-designed GPU-accelerated containerized ML infra (CUDA + PyTorch), two-stage Docker builds, hardened cross-platform upload pipelines.",
    ],
  },
  {
    org: "DesignGurus",
    role: "Full-Stack Developer",
    period: "2024",
    kind: "main",
    bullets: [
      "Shipped a multi-tool AI command center (Gemini function calling, 30+ tools) with conversational state, saved filters, shareable links (~5k LOC).",
      "Built MongoDB $facet aggregation pipelines: revenue/bundle allocation, cohort analysis, security forensics.",
      "Built an AI Roadmapper (Gemini, Borda-score filtering, TTL caching, daily generation limits).",
      "Led LLM model migrations (gpt-4 → gpt-5-nano, Gemini upgrades) with regression testing and tool-call compatibility fixes.",
      "Shipped flashcard authoring (bulk upsert, E11000 handling), an ISR cache-revalidation dashboard, and AI chat reliability fixes.",
    ],
  },
  {
    org: "Freelance / CyberPheonix",
    role: "Developer",
    period: "2022 - 2024",
    kind: "prologue",
    bullets: [
      "Japanese→English LLM with a UI, generative-AI tooling for tech-support automation, AWS-hosted services, network admin.",
    ],
  },
];
