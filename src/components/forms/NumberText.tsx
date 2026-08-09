import { useState } from "react";

/** Numeric input that keeps raw typed text until blur, so partial entries are never wiped. */
export function NumberText({
  label,
  value,
  onCommit,
  max = 1000,
  placeholder,
}: {
  label: string;
  value: number | null | undefined;
  onCommit: (n: number | null) => void;
  max?: number;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-foreground-muted">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={draft ?? (value == null ? "" : String(value))}
        onChange={(e) => setDraft(e.target.value.slice(0, 6))}
        onBlur={() => {
          if (draft === null) return;
          const raw = draft.trim();
          if (!raw) { setDraft(null); setError(null); onCommit(null); return; }
          const n = Number(raw);
          if (!Number.isFinite(n) || n < 0) { setError("Enter a number"); return; }
          if (n > max) { setError(`Max ${max}`); return; }
          setError(null);
          setDraft(null);
          onCommit(Math.round(n * 10) / 10);
        }}
        className="mt-1 w-full h-11 bg-transparent border border-border px-3 text-bone"
      />
      {error && <span className="mt-1 block text-signal text-[11px]">{error}</span>}
    </label>
  );
}
