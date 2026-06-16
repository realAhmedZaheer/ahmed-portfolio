import { describe, it, expect } from "vitest";
import { rankDocs, type RagDoc } from "./ragDemo";

const docs: RagDoc[] = [
  { id: "refunds", title: "Refund policy", text: "Customers can request a refund within 30 days of purchase." },
  { id: "shipping", title: "Shipping times", text: "Orders ship within 2 business days worldwide." },
  { id: "auth", title: "Account security", text: "Enable two-factor authentication for account security." },
];

describe("rankDocs", () => {
  it("ranks the most relevant document first with score 1", () => {
    const ranked = rankDocs("how do I get a refund for my purchase", docs);
    expect(ranked[0].doc.id).toBe("refunds");
    expect(ranked[0].score).toBe(1);
    expect(ranked[1].score).toBeLessThan(1);
  });

  it("returns zero scores for an empty query", () => {
    const ranked = rankDocs("", docs);
    expect(ranked.every((r) => r.score === 0)).toBe(true);
  });
});
