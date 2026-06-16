"use client";
import { useEffect, useRef } from "react";
import { isReducedMotion } from "@/lib/motionPref";

interface Dot { x: number; y: number; z: number; tw: number }

/**
 * Shared atmospheric backdrop for the game screens: a sparse, dim, slowly drifting
 * deep-field that says "you are still inside the system" without competing with the
 * content. Mounted once in ScreenShell behind everything. Reduced motion draws a
 * single static frame.
 */
export function ScreenAtmosphere() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = isReducedMotion();
    const dots: Dot[] = [];
    let raf = 0;

    const seed = () => {
      const w = canvas.width, h = canvas.height;
      if (dots.length) return;
      for (let i = 0; i < 22; i++) {
        dots.push({ x: Math.random() * w, y: Math.random() * h, z: 0.3 + Math.random() * 0.7, tw: Math.random() * Math.PI * 2 });
      }
    };

    const draw = () => {
      const w = (canvas.width = canvas.clientWidth || window.innerWidth);
      const h = (canvas.height = canvas.clientHeight || window.innerHeight);
      seed();
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        if (!reduced) { d.y += 0.06 + d.z * 0.12; d.tw += 0.02; if (d.y > h) { d.y = 0; d.x = Math.random() * w; } }
        const a = (0.04 + 0.07 * d.z) * (0.6 + 0.4 * Math.sin(d.tw));
        ctx.globalAlpha = Math.max(0, a);
        ctx.fillStyle = "#9488bd";
        ctx.fillRect(d.x, d.y, 1 + Math.round(d.z), 1 + Math.round(d.z));
      }
      ctx.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
