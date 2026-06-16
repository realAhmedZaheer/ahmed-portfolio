export interface ScreenLink { href: string; name: string }

/** The main progression chain (quest/arcade are side quests, excluded). */
export const PROGRESSION: ScreenLink[] = [
  { href: "/player", name: "PLAYER" },
  { href: "/stats", name: "STATS" },
  { href: "/work", name: "WORK" },
  { href: "/campaign", name: "LOG" },
  { href: "/contact", name: "CONTACT" },
];

/** Adjacent screens for a route; idx === -1 means it's outside the chain. */
export function adjacentScreens(pathname: string): {
  prev?: ScreenLink;
  next?: ScreenLink;
  idx: number;
} {
  const idx = PROGRESSION.findIndex((p) => p.href === pathname);
  if (idx === -1) return { idx };
  return { prev: PROGRESSION[idx - 1], next: PROGRESSION[idx + 1], idx };
}
