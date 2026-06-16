import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { QuestFlow } from "@/components/quest/QuestFlow";

export const metadata: Metadata = {
  title: "SIDE QUEST - CUSTOM ORDER",
  description:
    "Tell the forge what you're looking to build - agentic AI, ML pipelines, full-stack product - and get a demo of Ahmed Zaheer's matching work, made to order.",
};

export default function QuestScreen() {
  return (
    <Section id="quest" num="★" gameName="SIDE QUEST · CUSTOM ORDER" srLabel="Custom demo">
      <QuestFlow />
    </Section>
  );
}
