import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/seven3seven-logo.png.asset.json";

interface Props {
  className?: string;
  /** Approximate rendered height in px. Logo scales proportionally. */
  height?: number;
  asLink?: boolean;
  label?: string;
}

export function Seven3SevenLogo({
  className = "",
  height = 36,
  asLink = true,
  label = "SEVEN3SEVEN — Hybrid Fitness | Performance",
}: Props) {
  const img = (
    <img
      src={logoAsset.url}
      alt={label}
      height={height}
      style={{ height, width: "auto" }}
      className={`block select-none ${className}`}
      draggable={false}
    />
  );
  if (!asLink) return img;
  return (
    <Link to="/" aria-label={label} className="inline-flex items-center">
      {img}
    </Link>
  );
}
