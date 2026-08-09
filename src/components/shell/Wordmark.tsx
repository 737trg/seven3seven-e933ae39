import { Seven3SevenLogo } from "@/components/marketing/Seven3SevenLogo";

export function Wordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const width = size === "lg" ? 150 : size === "sm" ? 110 : 130;
  return <Seven3SevenLogo width={width} />;
}