import type { Metadata } from "next";
import { Press_Start_2P, Russo_One, VT323 } from "next/font/google";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { IntroPrompt } from "@/components/motion/IntroPrompt";
import { SoundProvider } from "@/components/motion/SoundProvider";
import { ScanlineOverlay } from "@/components/fx/ScanlineOverlay";
import { CursorFx } from "@/components/fx/CursorFx";
import { AchievementToaster } from "@/components/achievements/AchievementToaster";
import "./globals.css";

/**
 * Runs before paint: sets <html data-motion> from the stored MOTION FX?
 * choice (falling back to the OS preference) so there is no motion flash.
 */
const motionInitScript = `(function(){var p=null;try{p=localStorage.getItem("az_motion_v1");}catch(e){}var r;try{r=p?p==="reduced":matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){r=false;}document.documentElement.dataset.motion=r?"reduced":"full";})();`;

const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--ff-pixel",
  display: "swap",
});

const term = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--ff-term",
  display: "swap",
});

/** Angular display face for the game-title logo only. */
const logo = Russo_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--ff-logo",
  display: "swap",
});

const SITE_URL = "https://ahmedzaheer.dev"; // placeholder until the domain is live
const DESCRIPTION =
  "Ahmed Zaheer - production AI/ML and full-stack engineer in Melbourne. Agentic LLM systems and generative-ML infrastructure, shipped end-to-end.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ahmed Zaheer - AI/ML Engineer",
    template: "%s · AHMED ZAHEER",
  },
  description: DESCRIPTION,
  keywords: [
    "Ahmed Zaheer",
    "AI/ML engineer",
    "full-stack developer",
    "LLM",
    "agentic AI",
    "Gemini",
    "Next.js",
    "Melbourne",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Ahmed Zaheer",
    title: "Ahmed Zaheer - AI/ML Engineer",
    description: DESCRIPTION,
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahmed Zaheer - AI/ML Engineer",
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${pixel.variable} ${term.variable} ${logo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: motionInitScript }} />
        <MotionProvider>
          {children}
          <ScanlineOverlay />
          <CursorFx />
          <AchievementToaster />
          <SoundProvider />
          <IntroPrompt />
        </MotionProvider>
      </body>
    </html>
  );
}
