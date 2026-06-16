export interface Stage {
  key: string;
  label: string;
  weight: number;
}

export type SampleScores = Record<string, number>;

/** Weighted multi-metric score (0-100). */
export function weightedScore(stages: Stage[], scores: SampleScores): number {
  const total = stages.reduce((a, s) => a + s.weight, 0);
  if (total === 0) return 0;
  const sum = stages.reduce((a, s) => a + s.weight * (scores[s.key] ?? 0), 0);
  return Math.round((sum / total) * 100);
}
