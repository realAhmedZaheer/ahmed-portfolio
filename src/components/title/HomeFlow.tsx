"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { TitleScreen } from "@/components/title/TitleScreen";

// Code-split the one-time cinematic out of the home bundle - this keeps GSAP
// (boot) and the warp generator off the critical path. ssr:false because they
// are client-only overlays; the title screen below carries the SSR/SEO content.
const BootSequence = dynamic(
  () => import("@/components/boot/BootSequence").then((m) => m.BootSequence),
  { ssr: false },
);
const WarpLoading = dynamic(
  () => import("@/components/title/WarpLoading").then((m) => m.WarpLoading),
  { ssr: false },
);

type Phase = "boot" | "warp" | "title";

/**
 * The home-screen cinematic chain: CRT boot → warp loading → title reveal.
 * If the boot is skipped (in-app navigation back, reduced motion, already
 * played this load), the warp is skipped too - straight to the title.
 * TitleScreen stays mounted underneath throughout (SEO + no flash).
 */
export function HomeFlow() {
  const [phase, setPhase] = useState<Phase>("boot");

  return (
    <>
      {phase !== "title" && <div aria-hidden className="fixed inset-0 z-[99] bg-[#070310]" />}
      {phase === "boot" && (
        <BootSequence onComplete={(played) => setPhase(played ? "warp" : "title")} />
      )}
      {phase === "warp" && <WarpLoading onComplete={() => setPhase("title")} />}
      <TitleScreen phase={phase} />
    </>
  );
}
