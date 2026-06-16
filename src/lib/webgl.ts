let cached: boolean | null = null;

/** Whether the browser can give us a WebGL context (memoized). False in jsdom. */
export function supportsWebGL(): boolean {
  if (cached !== null) return cached;
  if (typeof document === "undefined") return (cached = false);
  try {
    const c = document.createElement("canvas");
    cached = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    cached = false;
  }
  return cached;
}
