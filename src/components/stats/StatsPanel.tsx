"use client";
import { motion } from "framer-motion";
import { skills } from "@/content/skills";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { useReducedMotion } from "@/lib/useReducedMotion";

const ICONS = ["◆", "▲", "■", "●", "★"];
const SEGMENT_COUNT = 10;
/** Decorative mastery segments per category (pure flavor, aria-hidden). */
const SEGMENTS = [9, 8, 9, 9, 8];

/** Total skill items across all categories - drives the summary footer. */
const TOTAL_ITEMS = skills.reduce((n, cat) => n + cat.items.length, 0);

/**
 * One mastery bar: filled segments light up sequentially (left→right) when the
 * panel reveals. Reduced motion shows every segment at its final state instantly.
 */
function MasteryBar({ filled, reduced }: { filled: number; reduced: boolean }) {
  return (
    <span aria-hidden className="flex gap-[3px]">
      {Array.from({ length: SEGMENT_COUNT }, (_, s) => {
        const lit = s < filled;
        if (!lit) {
          return <span key={s} className="h-2.5 w-1.5 bg-purple/25" />;
        }
        if (reduced) {
          return <span key={s} className="h-2.5 w-1.5 bg-cyan" />;
        }
        return (
          <motion.span
            key={s}
            className="h-2.5 w-1.5 origin-left bg-cyan"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{
              // wait for the panels to settle, then ripple the fill left→right
              delay: 0.45 + s * 0.06,
              duration: 0.18,
              ease: [0.2, 0.7, 0.2, 1],
            }}
            style={{ boxShadow: "0 0 4px var(--cyan, #22d3ee)" }}
          />
        );
      })}
    </span>
  );
}

/** Skills as a game inventory: category panels with pixel icons + item chips. */
export function StatsPanel() {
  const reduced = useReducedMotion();

  return (
    <div>
      <RevealGroup className="grid gap-5 md:grid-cols-2">
        {skills.map((cat, i) => (
          <RevealItem key={cat.name}>
            <section
              aria-label={cat.name}
              className="pixel-corners h-full border-2 border-purple/40 bg-gradient-to-br from-bg2 to-[#0a0716]"
            >
              <header className="flex items-center justify-between border-b-2 border-purple/30 bg-purple/15 px-4 py-3">
                <h3 className="font-pixel text-[9px] text-cyan">
                  {reduced ? (
                    <span aria-hidden className="mr-2 text-yellow">
                      {ICONS[i % ICONS.length]}
                    </span>
                  ) : (
                    <motion.span
                      aria-hidden
                      className="mr-2 inline-block text-yellow"
                      initial={{ opacity: 0.2, filter: "brightness(0.6)", scale: 0.85 }}
                      animate={{
                        opacity: [0.2, 1, 1],
                        filter: ["brightness(0.6)", "brightness(2.4)", "brightness(1)"],
                        scale: [0.85, 1.15, 1],
                      }}
                      transition={{ duration: 0.4, delay: 0.35 + i * 0.08, times: [0, 0.4, 1] }}
                    >
                      {ICONS[i % ICONS.length]}
                    </motion.span>
                  )}
                  {cat.name.toUpperCase()}
                </h3>
                <MasteryBar filled={SEGMENTS[i % SEGMENTS.length]} reduced={reduced} />
              </header>
              {reduced ? (
                <ul className="flex flex-wrap gap-2 p-4">
                  {cat.items.map((item) => (
                    <li
                      key={item}
                      className="font-term border border-purple/40 bg-black/30 px-2 py-0.5 text-lg leading-snug text-[#c8bff0]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <motion.ul
                  className="flex flex-wrap gap-2 p-4"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: {
                      transition: { staggerChildren: 0.04, delayChildren: 0.4 + i * 0.05 },
                    },
                  }}
                >
                  {cat.items.map((item) => (
                    <motion.li
                      key={item}
                      className="font-term border border-purple/40 bg-black/30 px-2 py-0.5 text-lg leading-snug text-[#c8bff0]"
                      variants={{
                        hidden: { opacity: 0, scale: 0.85 },
                        show: {
                          opacity: 1,
                          scale: 1,
                          transition: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] },
                        },
                      }}
                    >
                      {item}
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </section>
          </RevealItem>
        ))}
      </RevealGroup>

      <p
        aria-hidden
        className="font-pixel mt-5 text-center text-[8px] leading-relaxed text-purple/55"
      >
        SYSTEMS LOADED: {TOTAL_ITEMS} ITEMS · SECTORS: {skills.length} · STATUS: OPERATIONAL
      </p>
    </div>
  );
}
