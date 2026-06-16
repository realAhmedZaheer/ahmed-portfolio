import { cn } from "@/lib/cn";

interface GlitchTextProps {
  text: string;
  as?: React.ElementType;
  className?: string;
}

/** Chromatic-aberration heading via CSS pseudo-elements (.glitch in globals.css). */
export function GlitchText({ text, as: Tag = "span", className }: GlitchTextProps) {
  return (
    <Tag className={cn("glitch font-pixel", className)} data-text={text}>
      {text}
    </Tag>
  );
}
