export interface RagDoc {
  id: string;
  title: string;
  text: string;
}

export interface RankedDoc {
  doc: RagDoc;
  /** 0..1, normalized against the best match in the set. */
  score: number;
}

const tokenize = (s: string): Set<string> =>
  new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2),
  );

/** Rank docs by token-overlap similarity to the query, normalized 0-1. */
export function rankDocs(query: string, docs: RagDoc[]): RankedDoc[] {
  const q = tokenize(query);
  const raw = docs.map((doc) => {
    const d = tokenize(`${doc.title} ${doc.text}`);
    let overlap = 0;
    for (const w of q) if (d.has(w)) overlap++;
    const score = q.size === 0 || d.size === 0 ? 0 : overlap / Math.sqrt(d.size);
    return { doc, score };
  });
  const max = raw.reduce((m, r) => (Number.isFinite(r.score) && r.score > m ? r.score : m), 0);
  return raw
    .map((r) => ({ doc: r.doc, score: max === 0 ? 0 : r.score / max }))
    .sort((a, b) => b.score - a.score);
}
