"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HudNav } from "@/components/hud/HudNav";
import { ScreenNav } from "@/components/screens/ScreenNav";
import { adjacentScreens } from "@/components/screens/progression";
import { ScreenAtmosphere } from "@/components/screens/ScreenAtmosphere";
import { Footer } from "@/components/layout/Footer";
import { playSound } from "@/lib/sfx";
import { recordVisit, unlock } from "@/lib/achievements";

/** Progression order + the real (screen-reader) page heading per route.
    n === 0 marks a side quest - outside the main 1-5 progression. */
const SCREEN_INFO: Record<string, { n: number; name: string; h1: string }> = {
  "/player": { n: 1, name: "PLAYER SELECT", h1: "About - Ahmed Zaheer" },
  "/stats": { n: 2, name: "STATS · INVENTORY", h1: "Skills - Ahmed Zaheer" },
  "/work": { n: 3, name: "LEVEL SELECT", h1: "Work - Ahmed Zaheer" },
  "/campaign": { n: 4, name: "CAMPAIGN LOG", h1: "Experience - Ahmed Zaheer" },
  "/contact": { n: 5, name: "CONTINUE?", h1: "Contact - Ahmed Zaheer" },
  "/quest": { n: 0, name: "CUSTOM ORDER", h1: "Custom demo - Ahmed Zaheer" },
  "/arcade": { n: 0, name: "ARCADE", h1: "Arcade - Ahmed Zaheer" },
};

/**
 * Shared chrome for all game screens: a skip link, a real per-route <h1>,
 * route-aware HUD, the CRT frame-cut on navigation, a scoped ESC→title, and a
 * bottom hint bar like a fighting-game HUD.
 */
export function ScreenShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Don't hijack Escape while typing or while a transition overlay (warp /
      // game-over) is mid-navigation - that would race the overlay's own push.
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el?.isContentEditable) return;
      if (document.querySelector("[data-nav-overlay]")) return;
      unlock("escape-artist");
      playSound("back");
      router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  // Every screen starts at its top frame - never inherit the previous
  // screen's scroll offset. A "shunk" cut on each change (skip the first).
  const firstScreen = useRef(true);
  useEffect(() => {
    window.scrollTo(0, 0);
    recordVisit(pathname);
    if (pathname === "/contact") unlock("first-contact");
    if (firstScreen.current) {
      firstScreen.current = false;
    } else {
      playSound("cut");
    }
  }, [pathname]);

  const info = SCREEN_INFO[pathname];
  const { prev, next } = adjacentScreens(pathname);

  return (
    <>
      <a href="#main" className="skip-link">
        SKIP TO CONTENT
      </a>
      <ScreenAtmosphere />
      <HudNav />
      <ScreenNav />
      <div key={pathname} className="screen-in flex flex-1 flex-col pb-12 pt-14">
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {info && <h1 className="sr-only">{info.h1}</h1>}
          {children}
        </main>
        <Footer />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[95] border-t-2 border-purple/40 bg-bg2/95">
        <div className="font-pixel mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-2 text-[7px] text-dim">
          <div className="flex flex-1 items-center">
            {prev ? (
              <Link
                href={prev.href}
                onClick={() => playSound("back")}
                aria-label={`Previous screen: ${prev.name}`}
                className="gx text-cyan sm:hidden"
              >
                ◀&nbsp;{prev.name}
              </Link>
            ) : (
              <span className="sm:hidden" />
            )}
            <span aria-hidden className="hidden sm:inline">ESC ◀ TITLE</span>
          </div>
          {info && (
            <span aria-hidden className="shrink-0 text-center text-cyan">
              {info.n === 0
                ? `★ SIDE QUEST - ${info.name}`
                : `SCREEN ${info.n}/5 - ${info.name}`}
            </span>
          )}
          <div className="flex flex-1 items-center justify-end">
            {next ? (
              <Link
                href={next.href}
                onClick={() => playSound("confirm")}
                aria-label={`Next screen: ${next.name}`}
                className="gx text-cyan sm:hidden"
              >
                {next.name}&nbsp;▶
              </Link>
            ) : (
              <span className="sm:hidden" />
            )}
            <span aria-hidden className="hidden sm:inline">↑↓ / SCROLL</span>
          </div>
        </div>
      </div>
    </>
  );
}
