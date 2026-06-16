/** Fixed CRT overlay: scanlines + pixel grid + vignette. Purely decorative. */
export function ScanlineOverlay() {
  return <div aria-hidden data-testid="scanlines" className="crt-overlay" />;
}
