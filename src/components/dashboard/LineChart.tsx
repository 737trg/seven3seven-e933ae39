import { useId, useMemo, useState } from "react";

export interface ChartPoint {
  /** ISO date. */
  date: string;
  value: number;
}

/**
 * Small SVG line chart with axis labels and a hover/tap readout.
 * Values are also announced in text by the callers, so it stays presentational.
 */
export function LineChart({
  points,
  direction = "higher",
  format,
  overlay,
  height = 160,
}: {
  points: ChartPoint[];
  direction?: "higher" | "lower";
  format: (value: number) => string;
  /** Optional secondary series (e.g. rolling average). */
  overlay?: ChartPoint[];
  height?: number;
}) {
  const gradientId = useId();
  const [active, setActive] = useState<number | null>(null);

  const geometry = useMemo(() => {
    const w = 320;
    const h = 120;
    const values = points.map((p) => p.value);
    const overlayValues = overlay?.map((p) => p.value) ?? [];
    const all = [...values, ...overlayValues];
    const min = Math.min(...all);
    const max = Math.max(...all);
    const pad = (max - min) * 0.15 || Math.max(1, Math.abs(max) * 0.05);
    const lo = min - pad;
    const hi = max + pad;
    const span = hi - lo || 1;
    const x = (i: number, len: number) => (len <= 1 ? w / 2 : (i / (len - 1)) * w);
    const y = (v: number) => h - ((v - lo) / span) * h;
    return { w, h, lo, hi, x, y, min, max };
  }, [points, overlay]);

  if (points.length === 0) return null;

  const { w, h, x, y, lo, hi } = geometry;
  const line = points.map((p, i) => `${x(i, points.length).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${line} ${w},${h} 0,${h}`;
  const overlayLine = overlay?.length
    ? overlay.map((p, i) => `${x(i, overlay.length).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ")
    : null;

  const first = points[0].value;
  const last = points[points.length - 1].value;
  const improving = direction === "lower" ? last <= first : last >= first;
  const stroke = improving ? "var(--earned)" : "var(--signal)";
  const shown = active != null ? points[active] : points[points.length - 1];

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-bone font-display text-xl tabular tracking-tight">{format(shown.value)}</p>
        <p className="text-foreground-muted text-[10px] uppercase tracking-widest">
          {new Date(shown.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>

      <div className="relative mt-3" style={{ height }}>
        <div className="absolute inset-0 flex flex-col justify-between text-foreground-muted text-[9px] tabular">
          <span>{format(hi)}</span>
          <span>{format(lo)}</span>
        </div>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          role="presentation"
          className="h-full w-full"
          onMouseLeave={() => setActive(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="var(--border)" strokeWidth="0.5" opacity="0.5" />
          ))}

          {points.length > 1 && <polygon points={area} fill={`url(#${gradientId})`} />}
          {points.length > 1 && (
            <polyline points={line} fill="none" stroke={stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" />
          )}
          {overlayLine && overlay!.length > 1 && (
            <polyline
              points={overlayLine}
              fill="none"
              stroke="var(--bone)"
              strokeWidth="1"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
              opacity="0.55"
            />
          )}

          {points.map((p, i) => (
            <circle
              key={`${p.date}-${i}`}
              cx={x(i, points.length)}
              cy={y(p.value)}
              r={active === i ? 4 : 2.5}
              fill={active === i ? "var(--bone)" : stroke}
              vectorEffect="non-scaling-stroke"
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
            />
          ))}
        </svg>
      </div>

      <div className="mt-2 flex justify-between text-foreground-muted text-[9px] uppercase tracking-widest">
        <span>{new Date(points[0].date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
        <span>
          {new Date(points[points.length - 1].date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
        </span>
      </div>
    </div>
  );
}