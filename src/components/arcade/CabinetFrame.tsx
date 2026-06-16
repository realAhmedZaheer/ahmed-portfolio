"use client";

type Tone = "cyan" | "yellow" | "dim" | "pink";
const TONE_VAR: Record<Tone, string> = {
  cyan: "var(--cyan)",
  yellow: "var(--yellow)",
  dim: "var(--dim)",
  pink: "var(--pink)",
};

export interface CabinetButton {
  label: string;
  onClick(): void;
  primary?: boolean;
  tone?: Tone;
}

const LED_COLOR = { green: "#7cffb2", amber: "#f59e0b", off: "#1a1530" };

/** Decorative pixel joystick - static SVG, wobbles on hover. */
function Joystick({ accent }: { accent: string }) {
  return (
    <span aria-hidden className="cab-joy inline-block">
      <svg width={44} height={56} viewBox="0 0 11 14" shapeRendering="crispEdges">
        {/* base */}
        <rect x={1} y={11} width={9} height={3} fill="#1a1530" />
        <rect x={2} y={10} width={7} height={1} fill="#2a2a3a" />
        {/* shaft */}
        <rect x={5} y={4} width={1} height={7} fill="#2a2a3a" />
        {/* ball */}
        <rect x={3} y={1} width={5} height={3} fill={accent} />
        <rect x={4} y={0} width={3} height={1} fill={accent} />
      </svg>
    </span>
  );
}

/**
 * The maximized arcade cabinet chrome - depth via color/shading (no geometric
 * transforms, which would blur the pixel art). A backlit marquee, a recessed CRT
 * screen holding the active panel, and a control deck with big pixel buttons +
 * a joystick. (creative-direction - Cabinet Art Direction)
 */
export function CabinetFrame({
  title,
  accent = "#22d3ee",
  led = "green",
  children,
  buttons,
}: {
  title: string;
  accent?: string;
  led?: "green" | "amber" | "off";
  children: React.ReactNode;
  buttons: CabinetButton[];
}) {
  return (
    <div className="mx-auto w-full max-w-md select-none">
      {/* BODY */}
      <div className="relative border-2 border-purple/30 bg-bg2 pl-2 pr-1 pt-1">
        {/* left neon side panel + top bevel */}
        <span aria-hidden className="cab-side absolute inset-y-0 left-0 w-1.5" style={{ background: accent, boxShadow: `0 0 10px ${accent}` }} />
        <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-white/10" />

        {/* MARQUEE - backlit panel with a chase-light top edge */}
        <div className="cab-power relative mb-1 overflow-hidden border-2 px-3 py-2 text-center" style={{ borderColor: `${accent}66`, background: `linear-gradient(90deg, ${accent}11, ${accent}33, ${accent}11)` }}>
          <div aria-hidden className="absolute inset-x-1 top-0.5 flex justify-between">
            {Array.from({ length: 16 }, (_, i) => (
              <span key={i} className="cab-bulb h-1 w-1" style={{ background: accent, animationDelay: `${i * 90}ms` }} />
            ))}
          </div>
          <span className="font-logo text-lg text-white" style={{ textShadow: `0 0 12px ${accent}` }}>
            {title}
          </span>
        </div>

        {/* SCREEN - recessed CRT bezel holding the active panel */}
        <div className="relative border-2 border-[#060310] bg-[#060310] p-1">
          <div className="relative h-[58vh] max-h-[440px] min-h-[300px] overflow-hidden border-l-2 border-t-2 border-white/[0.06] bg-bg">
            <div className="h-full w-full overflow-y-auto">{children}</div>
            {/* glass glare + scanlines, above content, below modals */}
            <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%)" }} />
            <span aria-hidden className="cab-scan pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px)", backgroundSize: "7px 7px" }} />
            {/* power LED */}
            <span aria-hidden className="cab-led absolute bottom-1 left-1 h-1 w-1" style={{ background: LED_COLOR[led], boxShadow: led === "off" ? "none" : `0 0 6px ${LED_COLOR[led]}` }} />
          </div>
        </div>

        {/* CONTROL DECK */}
        <div className="flex items-center gap-4 px-3 py-4" style={{ background: "linear-gradient(180deg, rgba(0,0,0,.35), rgba(255,255,255,.03))" }}>
          <Joystick accent={accent} />
          <div className="grid flex-1 grid-cols-2 gap-2">
            {buttons.map((b) => {
              const tone = TONE_VAR[b.tone ?? "dim"];
              return (
                <button
                  key={b.label}
                  type="button"
                  onClick={(e) => {
                    const el = e.currentTarget;
                    el.classList.remove("cab-btn-flash");
                    void el.offsetWidth; // restart the flash animation
                    el.classList.add("cab-btn-flash");
                    b.onClick();
                  }}
                  className="cab-btn font-pixel gx pixel-corners min-h-[40px] border-2 px-3 py-2 text-[8px]"
                  style={{
                    borderColor: tone,
                    color: tone,
                    borderWidth: b.primary ? 3 : 2,
                    background: `${tone}14`,
                    boxShadow: b.primary ? `0 0 14px ${tone}66` : "none",
                  }}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* BASE / FEET - narrower bar reads as the cabinet tapering at the floor */}
      <div aria-hidden className="mx-auto h-3 w-[90%] border-x-2 border-b-2 border-purple/30 bg-[#0a0716]" />
    </div>
  );
}
