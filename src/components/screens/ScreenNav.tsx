"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { adjacentScreens } from "./progression";

function Arrow({ dir, href, name }: { dir: "prev" | "next"; href: string; name: string }) {
  const left = dir === "prev";
  return (
    <Link
      href={href}
      aria-label={`${left ? "Previous" : "Next"} screen: ${name}`}
      className={cn(
        "gx fixed top-1/2 z-[92] hidden -translate-y-1/2 items-center justify-center px-5 py-12 text-4xl leading-none text-cyan/75 hover:text-cyan hover:[text-shadow:0_0_12px_var(--cyan)] sm:flex sm:px-7",
        left ? "left-0" : "right-0",
      )}
    >
      <span aria-hidden>{left ? "◁" : "▷"}</span>
    </Link>
  );
}

/** Edge ◁ / ▷ buttons that step through the progression screens (desktop only). */
export function ScreenNav() {
  const pathname = usePathname() ?? "";
  const { prev, next, idx } = adjacentScreens(pathname);
  if (idx === -1) return null;
  return (
    <>
      {prev && <Arrow dir="prev" href={prev.href} name={prev.name} />}
      {next && <Arrow dir="next" href={next.href} name={next.name} />}
    </>
  );
}
