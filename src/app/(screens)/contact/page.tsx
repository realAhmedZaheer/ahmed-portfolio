import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { ContactMenu } from "@/components/contact/ContactMenu";

export const metadata: Metadata = {
  title: "CONTINUE? - CONTACT",
  description:
    "Contact Ahmed Zaheer - email, LinkedIn, resume. Melbourne, AU. Open to AI/ML and full-stack roles.",
};

export default function ContactScreen() {
  return (
    <Section id="contact" num="05" gameName="INSERT COIN" srLabel="Contact">
      <ContactMenu />
    </Section>
  );
}
