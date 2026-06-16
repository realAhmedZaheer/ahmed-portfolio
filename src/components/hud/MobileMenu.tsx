"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { playSound } from "@/lib/sfx";

interface Screen { href: string; label: string }

/** Full-screen mobile nav overlay. Esc/✕/selection closes; focus is trapped while open. */
export function MobileMenu({
  open, onClose, screens, pathname,
}: { open: boolean; onClose(): void; screens: Screen[]; pathname: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const root = ref.current;
    root?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    const focusables = () =>
      Array.from(root?.querySelectorAll<HTMLElement>("a[href],button") ?? []);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); return; }
      if (e.key !== "Tab") return;
      const els = focusables();
      if (els.length === 0) return;
      const first = els[0], last = els[els.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      ref={ref}
      data-nav-overlay
      role="dialog"
      aria-modal="true"
      aria-label="Screens"
      className="fixed inset-0 z-[120] flex flex-col bg-bg/97 sm:hidden"
    >
      <div className="flex items-center justify-between border-b-2 border-purple/40 px-4 py-3">
        <span className="font-pixel text-[10px] text-cyan">AZ<span className="text-pink">▮</span></span>
        <button
          type="button"
          data-autofocus
          onClick={() => { playSound("back"); onClose(); }}
          aria-label="Close menu"
          className="font-pixel gx px-2 text-[14px] text-dim hover:text-white"
        >
          ✕
        </button>
      </div>
      <nav aria-label="Screens" className="flex flex-1 flex-col justify-center gap-1 px-7">
        {screens.map((s) => {
          const active = pathname === s.href;
          return (
            <Link
              key={s.href}
              href={s.href}
              aria-current={active ? "page" : undefined}
              onClick={() => { playSound("confirm"); onClose(); }}
              className={cn(
                "font-pixel gx py-3 text-[15px]",
                active ? "text-yellow" : "text-dim hover:text-white",
              )}
            >
              {active && <span aria-hidden>▶&nbsp;</span>}
              {s.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
