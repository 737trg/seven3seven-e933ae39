/** Tiny inline trend line. Purely decorative — values are announced in text. */
export function Sparkline({
  values,
  direction = "higher",
  className = "",
}: {
  values: number[];
  direction?: "higher" | "lower";
  className?: string;
}) {
  if (values.length < 2) return null;
  const w = 100;
  const h = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const first = values[0];
  const last = values[values.length - 1];
  const improving = direction === "lower" ? last < first : last > first;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      role="presentation"
      aria-hidden="true"
      className={`w-full h-7 ${className}`}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        className={improving ? "text-earned" : "text-foreground-muted"}
      />
    </svg>
  );
}
