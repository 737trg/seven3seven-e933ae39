import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/seven3seven-wordmark.png.asset.json";

interface Props {
  className?: string;
  /** Rendered width in px. The wordmark scales proportionally. */
  width?: number;
  asLink?: boolean;
  label?: string;
}

export function Seven3SevenLogo({
  className = "",
  width = 160,
  asLink = true,
  label = "SEVEN3SEVEN — Hybrid Fitness | Performance",
}: Props) {
  const img = (
    <img
      src={logoAsset.url}
      alt={label}
      width={width}
      style={{ width, height: "auto" }}
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
