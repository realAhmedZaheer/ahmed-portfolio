import { ScreenShell } from "@/components/screens/ScreenShell";

export default function ScreensLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ScreenShell>{children}</ScreenShell>;
}
