import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { ProfileCard } from "@/components/profile/ProfileCard";

export const metadata: Metadata = {
  title: "PLAYER SELECT",
  description:
    "About Ahmed Zaheer - AI/ML engineer and full-stack developer in Melbourne, Australia.",
};

export default function PlayerScreen() {
  return (
    <Section id="profile" num="01" gameName="PLAYER SELECT" srLabel="About">
      <ProfileCard />
    </Section>
  );
}
