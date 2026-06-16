import type { Scenario } from "@/lib/agentDemo";
import type { Stage } from "@/lib/scoring";

/**
 * Illustrative agent scenarios for the AI Command Center demo.
 * All data is synthesized - no real customer data.
 */
export const agentScenarios: Scenario[] = [
  {
    id: "rev",
    prompt: "How did revenue trend last quarter?",
    tool: "get_revenue_rollup",
    argsPreview: `{ "range": "last_quarter", "groupBy": "bundle" }`,
    result:
      "Q-rollup: +18% QoQ · bundles drove 62% of net new revenue. (illustrative)",
  },
  {
    id: "fraud",
    prompt: "Any suspicious logins this week?",
    tool: "detect_impossible_travel",
    argsPreview: `{ "window": "7d", "threshold_km_h": 900 }`,
    result:
      "3 accounts flagged: impossible-travel + shared IP cluster. (illustrative)",
  },
  {
    id: "content",
    prompt: "Which courses have weak lesson coverage?",
    tool: "content_quality_scan",
    argsPreview: `{ "minLessons": 8, "status": "published" }`,
    result: "5 courses below threshold; 2 missing assessments. (illustrative)",
  },
];

/** Weighted stages for the Dataset Quality Analyzer demo. */
export const scoringStages: Stage[] = [
  { key: "sharpness", label: "Sharpness (Laplacian)", weight: 2 },
  { key: "siglip", label: "SigLIP relevance", weight: 2 },
  { key: "detect", label: "DETR objects", weight: 1 },
  { key: "dedup", label: "Uniqueness", weight: 2 },
  { key: "face", label: "Face cluster", weight: 1 },
];

/** Illustrative sample images and their per-stage scores (0..1). */
export const scoringSamples: {
  id: string;
  label: string;
  scores: Record<string, number>;
}[] = [
    {
      id: "img-01",
      label: "hero_shot.png",
      scores: { sharpness: 0.95, siglip: 0.9, detect: 0.8, dedup: 1, face: 0.7 },
    },
    {
      id: "img-02",
      label: "blurry_dupe.png",
      scores: { sharpness: 0.2, siglip: 0.6, detect: 0.5, dedup: 0.1, face: 0.4 },
    },
    {
      id: "img-03",
      label: "clean_subject.png",
      scores: { sharpness: 0.8, siglip: 0.85, detect: 0.9, dedup: 0.95, face: 0.9 },
    },
  ];
