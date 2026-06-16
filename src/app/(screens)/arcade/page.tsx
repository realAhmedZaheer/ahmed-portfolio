import type { Metadata } from "next";
import { ArcadeHub } from "@/components/arcade/ArcadeHub";

export const metadata: Metadata = {
  title: "ARCADE",
  description: "Ahmed Zaheer's arcade - play DEFRAG.EXE, a block-stacking firewall breach.",
};

export default function ArcadeScreen() {
  return <ArcadeHub />;
}
