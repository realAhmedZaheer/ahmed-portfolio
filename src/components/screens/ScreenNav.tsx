"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/** The main progression chain (quest is a side quest, excluded). */
const PROGRESSION = [
  { href: "/player", name: "PLAYER" },
  { href: "/stats", name: "STATS" },
  { href: "/work", name: "WORK" },
  { href: "/campaign", name: "LOG" },
  { href: "/contact", name: "CONTACT" },
];

function Arrow({ dir, href, name }: { dir: "prev" | "next"; href: string; name: string }) {
  const left = dir === "prev";
  return (
    <Link
      href={href}
      aria-label={`${left ? "Previous" : "Next"} screen: ${name}`}
      className={cn(
        "gx fixed top-1/2 z-[92] flex -translate-y-1/2 items-center justify-center px-5 py-12 text-4xl leading-none text-cyan/75 hover:text-cyan hover:[text-shadow:0_0_12px_var(--cyan)] sm:px-7",
        left ? "left-0" : "right-0",
      )}
    >
      <span aria-hidden>{left ? "◁" : "▷"}</span>
    </Link>
  );
}

/** Edge ◀ / ▶ buttons that step through the progression screens. */
export function ScreenNav() {
  const pathname = usePathname() ?? "";
  const idx = PROGRESSION.findIndex((p) => p.href === pathname);
  if (idx === -1) return null;
  const prev = PROGRESSION[idx - 1];
  const next = PROGRESSION[idx + 1];
  return (
    <>
      {prev && <Arrow dir="prev" href={prev.href} name={prev.name} />}
      {next && <Arrow dir="next" href={next.href} name={next.name} />}
    </>
  );
}
