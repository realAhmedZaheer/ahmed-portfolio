import type { ContactLink } from "@/types/content";

export const contact: ContactLink[] = [
  { label: "Email", href: "mailto:ahmedzaheer9000@gmail.com", prompt: "△ START" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ahmed-z-28461426a/",
    prompt: "✕ CONNECT",
  },
  // Unhide when a GitHub URL is provided.
  { label: "GitHub", href: "#", prompt: "◻ CODE", hidden: true },
  { label: "Resume", href: "/Ahmed-Zaheer-Resume.pdf", prompt: "◯ DOWNLOAD" },
];
