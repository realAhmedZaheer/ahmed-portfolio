"use client";

/** A single labeled node in a pixel architecture diagram. */
export interface PixelDiagramNode {
  label: string;
  /** Tailwind text color class, e.g. "text-cyan". Defaults to cyan. */
  color?: string;
}

interface PixelDiagramProps {
  nodes: PixelDiagramNode[];
  /** Accessible description of the flow for screen readers. */
  srLabel?: string;
  className?: string;
}

/**
 * A row of neon `.pixel-corners` boxes joined by `▸` arrows - a tiny
 * pixel-art "architecture diagram" (e.g. [USER] ▸ [GEMINI] ▸ [RESULT]).
 * Purely decorative; pass `srLabel` to describe the flow for screen readers.
 */
export function PixelDiagram({ nodes, srLabel, className }: PixelDiagramProps) {
  return (
    <figure className={className}>
      {srLabel ? <figcaption className="sr-only">{srLabel}</figcaption> : null}
      <div aria-hidden className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
        {nodes.map((node, i) => (
          <span key={`${node.label}-${i}`} className="flex items-center gap-x-1.5">
            <span
              className={`pixel-corners border border-current/50 bg-black/40 px-2 py-1.5 font-pixel text-[7px] leading-none ${node.color ?? "text-cyan"
                } [text-shadow:0_0_6px_currentColor]`}
            >
              {node.label}
            </span>
            {i < nodes.length - 1 ? (
              <span className="font-pixel text-[8px] text-purple/80">▸</span>
            ) : null}
          </span>
        ))}
      </div>
    </figure>
  );
}
