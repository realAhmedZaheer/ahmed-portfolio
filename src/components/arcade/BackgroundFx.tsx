"use client";
import { useEffect, useState } from "react";
import { isReducedMotion } from "@/lib/motionPref";
import { supportsWebGL } from "@/lib/webgl";
import { CanvasBackground } from "./CanvasBackground";
import { WebGLBackground } from "./WebGLBackground";
import type { BgProps } from "./bgShared";

export type { BgPulseKind } from "./bgShared";

/**
 * Background chooser: the dense WebGL world when supported + full motion, else the
 * canvas fallback. First render is the canvas (SSR/jsdom-safe); a mount effect swaps
 * to WebGL when available - so the game always has a working, reactive background.
 */
export function BackgroundFx(props: BgProps) {
  const [webgl, setWebgl] = useState(false);
  useEffect(() => {
    setWebgl(supportsWebGL() && !isReducedMotion());
  }, []);
  return webgl ? <WebGLBackground {...props} /> : <CanvasBackground {...props} />;
}
