import { Seven3SevenLogo } from "@/components/marketing/Seven3SevenLogo";

export function Wordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const height = size === "lg" ? 24 : size === "sm" ? 12 : 16;
  return <Seven3SevenLogo height={height} />;
}