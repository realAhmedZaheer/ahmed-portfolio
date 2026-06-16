/** Shared types for the background (canvas + WebGL implementations + the chooser). */
export type BgPulseKind = "lock" | "clear" | "harddrop" | "overflow" | "crit" | "fail";
export interface BgPulse { kind: BgPulseKind; at: number; x?: number } // x: 0..1 horizontal origin
export interface BgProps {
  danger: number;
  level?: number;
  pulse?: BgPulse | null;
}
