import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { StatsPanel } from "@/components/stats/StatsPanel";
import { AdvanceButton } from "@/components/screens/AdvanceButton";

export const metadata: Metadata = {
  title: "STATS · INVENTORY",
  description:
    "Ahmed Zaheer's skills: AI/LLM engineering, cloud & GPU infrastructure, frontend & mobile, backend, and tooling.",
};

export default function StatsScreen() {
  return (
    <Section id="stats" num="02" gameName="STATS · INVENTORY" srLabel="Skills">
      <StatsPanel />
      <AdvanceButton href="/work" label="CONTINUE" next="LEVEL SELECT" />
    </Section>
  );
}
