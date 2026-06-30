import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type Variant = "primary" | "accent" | "ghost" | "outline";

const cls = (variant: Variant, size: "md" | "lg") => {
  const base =
    "inline-flex items-center justify-center gap-2 font-display font-medium tracking-wide uppercase transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const sizes = {
    md: "h-11 px-5 text-xs",
    lg: "h-14 px-7 text-sm",
  }[size];
  const variants = {
    primary: "bg-bone text-obsidian hover:bg-bone/90 rounded-[4px]",
    accent: "bg-signal text-bone hover:bg-signal/90 rounded-[4px]",
    ghost: "text-bone hover:text-bone/80",
    outline: "border border-bone/80 text-bone hover:bg-bone hover:text-obsidian rounded-[4px]",
  }[variant];
  return `${base} ${sizes} ${variants}`;
};

interface BProps {
  variant?: Variant;
  size?: "md" | "lg";
  to?: string;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
}

export function Button({
  variant = "primary",
  size = "md",
  to,
  href,
  onClick,
  children,
  className = "",
  type = "button",
}: BProps) {
  const klass = `${cls(variant, size)} ${className}`;
  if (to) {
    return (
      <Link to={to} className={klass}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={klass}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={klass}>
      {children}
    </button>
  );
}