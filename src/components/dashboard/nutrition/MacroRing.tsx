import { ringState } from "@/lib/nutrition";

const COLOURS = {
  under: "var(--color-bone, #EFEAE3)",
  hit: "var(--color-earned, #7BD88F)",
  over: "var(--color-signal, #E5484D)",
} as const;

/** Progress ring with a centred figure. Turns green on target, red when well over. */
export function MacroRing({
  label,
  consumed,
  target,
  unit,
  size = 84,
}: {
  label: string;
  consumed: number;
  target: number;
  unit?: string;
  size?: number;
}) {
  const { pct, status } = ringState(consumed, target);
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const remaining = Math.round(target - consumed);
  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-border" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={COLOURS[status]}
            strokeWidth={stroke}
            strokeLinecap="butt"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - Math.min(1, pct))}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 400ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display text-bone tabular leading-none" style={{ fontSize: size / 4.2 }}>
              {Math.round(consumed)}
            </p>
            <p className="text-foreground-muted text-[9px] tabular mt-0.5">/ {Math.round(target)}{unit}</p>
          </div>
        </div>
      </div>
      <p className="eyebrow text-foreground-muted text-center">{label}</p>
      <p className={`text-[10px] tabular -mt-1 ${status === "hit" ? "text-earned" : status === "over" ? "text-signal" : "text-foreground-muted"}`}>
        {remaining >= 0 ? `${remaining}${unit ?? ""} left` : `${Math.abs(remaining)}${unit ?? ""} over`}
      </p>
    </div>
  );
}