import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { CampaignLog } from "@/components/experience/CampaignLog";
import { GameOver } from "@/components/screens/GameOver";

export const metadata: Metadata = {
  title: "CAMPAIGN LOG",
  description:
    "Ahmed Zaheer's experience: AI/ML Engineer and Full-Stack Developer at DesignGurus (2023-present), earlier freelance work.",
};

export default function CampaignScreen() {
  return (
    <Section id="campaign" num="04" gameName="CAMPAIGN LOG" srLabel="Experience">
      <CampaignLog />
      <GameOver achievementId="campaign-clear" />
    </Section>
  );
}
