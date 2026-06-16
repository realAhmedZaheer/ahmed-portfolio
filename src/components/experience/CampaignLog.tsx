"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { experience } from "@/content/experience";
import { ScrollReveal } from "@/components/motion/Reveal";

/** Experience as a quest log: main campaign entries + a dimmed prologue.
 *  Entries slide in from the left on scroll; the timeline line draws itself
 *  top→bottom; markers pop/flash as their entry reveals. Reduced motion is
 *  handled globally by <MotionProvider> (transforms dropped, opacity kept). */
export function CampaignLog() {
  return (
    <ol className="relative ml-2 space-y-10 pl-8">
      {/* self-drawing timeline line (replaces the static dashed border) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-full w-0.5 bg-purple/40"
        style={{ transformOrigin: "top" }}
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
      />
      {experience.map((e, i) => {
        const prologue = e.kind === "prologue";
        const current = !prologue && i === 0;
        return (
          <motion.li
            key={`${e.org}-${e.role}`}
            className={cn("relative", prologue && "opacity-60")}
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: prologue ? 0.6 : 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1], delay: i * 0.12 }}
          >
            {/* timeline marker - pops + flashes as the entry reveals */}
            <motion.span
              aria-hidden
              className={cn(
                "absolute -left-[39px] top-1 h-3.5 w-3.5 border-2",
                prologue
                  ? "border-dim bg-bg2"
                  : "border-yellow bg-yellow [box-shadow:0_0_10px_rgba(253,224,71,.6)]",
              )}
              initial={{ scale: 0 }}
              whileInView={{ scale: [0, 1.6, 1], opacity: [0.4, 1, 1] }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.12 + 0.15 }}
            />
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h3 className="font-pixel text-[10px] text-white">{e.role.toUpperCase()}</h3>
              <span className="font-pixel text-[9px] text-cyan">{e.org}</span>
              <span className="font-term text-lg text-dim">{e.period}</span>
              <span
                className={cn(
                  "font-pixel border px-1.5 py-0.5 text-[7px]",
                  prologue ? "border-dim text-dim" : "border-pink/60 text-pink",
                  current && "flicker",
                )}
              >
                {prologue ? "PROLOGUE" : current ? "CURRENT QUEST" : "CAMPAIGN"}
              </span>
            </div>
            <ul className="mt-3 space-y-1.5">
              {e.bullets.map((b) => (
                <li key={b} className="font-term text-lg leading-snug text-[#c8bff0]">
                  <span aria-hidden className="mr-2 text-purple">▸</span>
                  {b}
                </li>
              ))}
            </ul>
          </motion.li>
        );
      })}

      {/* conclusion beat */}
      <li className="relative list-none">
        <ScrollReveal delay={0.1}>
          <p className="font-pixel text-[8px] leading-relaxed text-dim">
            &gt; CAMPAIGN STATUS: ACTIVE · SECTOR: MELBOURNE AU
          </p>
        </ScrollReveal>
      </li>
    </ol>
  );
}
