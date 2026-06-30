import { Link } from "@tanstack/react-router";

export function Wordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const text = size === "lg" ? "text-3xl" : size === "sm" ? "text-sm" : "text-base";
  return (
    <Link to="/" className="font-display font-bold tracking-tight inline-flex items-baseline gap-2 text-bone">
      <span className={`${text} leading-none`}>737</span>
      <span className={`${text} leading-none text-foreground-muted`}>TRG</span>
    </Link>
  );
}