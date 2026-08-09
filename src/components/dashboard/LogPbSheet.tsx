import { useMemo, useState } from "react";
import { Sheet } from "./Sheet";
import { MOVEMENTS, parseTimeInput, type Movement } from "@/lib/movementCatalogue";
import type { NewPersonalRecord } from "@/lib/usePersonalRecords";

const inputClass =
  "h-11 w-full bg-surface-raised/40 border border-border/60 px-3 text-bone text-sm focus:outline-none focus:border-bone";

/** Guided personal-best logging: pick a catalogue movement, enter the result. */
export function LogPbSheet({
  open,
  onClose,
  defaultUnit,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  defaultUnit: "kg" | "lb";
  onSave: (record: NewPersonalRecord) => Promise<{ error?: string }>;
}) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Movement | null>(null);
  const [customLabel, setCustomLabel] = useState("");
  const [value, setValue] = useState("");
  const [reps, setReps] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? MOVEMENTS.filter((m) => m.label.toLowerCase().includes(q)) : MOVEMENTS;
    const map = new Map<string, Movement[]>();
    for (const m of filtered) {
      const key = `${m.category === "cardio" ? "Cardio" : "Strength"} · ${m.group}`;
      map.set(key, [...(map.get(key) ?? []), m]);
    }
    return [...map.entries()];
  }, [query]);

  const close = () => {
    setPicked(null);
    setCustomLabel("");
    setValue("");
    setReps("");
    setError(null);
    setQuery("");
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const label = picked?.label ?? customLabel.trim();
    if (!label) return setError("Choose a movement first.");
    const metric = picked?.metric ?? "load";

    let numeric: number | null = null;
    if (metric === "time") numeric = parseTimeInput(value);
    else numeric = Number(value);
    if (numeric === null || !Number.isFinite(numeric) || numeric <= 0) {
      return setError(metric === "time" ? "Enter a time like 21:30." : "Enter a number greater than zero.");
    }

    const unit = metric === "time" ? "sec" : metric === "reps" ? "reps" : defaultUnit;

    setSaving(true);
    const res = await onSave({
      lift_label: label,
      lift_key: picked?.key,
      metric,
      value: numeric,
      reps: metric === "load" && reps ? Number(reps) : null,
      unit,
      achieved_on: date,
    });
    setSaving(false);
    if (res.error) return setError(res.error);
    close();
  };

  return (
    <Sheet open={open} onClose={close} title="Log a personal best">
      {!picked ? (
        <div>
          <input
            className={inputClass}
            placeholder="Search movements…"
            aria-label="Search movements"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="mt-4 space-y-5">
            {groups.map(([group, list]) => (
              <div key={group}>
                <p className="eyebrow text-foreground-muted">{group}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {list.map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setPicked(m)}
                      className="tap press text-left px-3 py-2.5 border border-border/60 text-bone text-sm hover:border-bone"
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {groups.length === 0 && (
              <p className="text-foreground-muted text-xs">No match. Use a custom benchmark below.</p>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-border/60">
            <p className="eyebrow text-foreground-muted">Custom benchmark</p>
            <div className="mt-2 flex gap-2">
              <input
                className={inputClass}
                placeholder="e.g. Sled push 50 m"
                aria-label="Custom benchmark name"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
              />
              <button
                type="button"
                disabled={!customLabel.trim()}
                onClick={() =>
                  setPicked({
                    key: "",
                    label: customLabel.trim(),
                    category: "other",
                    group: "Other",
                    metric: "load",
                    unit: defaultUnit,
                    direction: "higher",
                  })
                }
                className="tap press h-11 px-4 shrink-0 border border-border text-bone font-display text-[10px] uppercase tracking-[0.22em] disabled:opacity-40"
              >
                Use
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-bone font-display text-lg tracking-tight">{picked.label}</p>
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="tap press text-signal font-display text-[10px] uppercase tracking-[0.22em]"
            >
              Change
            </button>
          </div>

          {picked.metric === "time" ? (
            <input
              className={inputClass}
              placeholder="Time — mm:ss (e.g. 21:30)"
              aria-label="Time"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          ) : picked.metric === "reps" ? (
            <input
              className={inputClass}
              placeholder="Reps"
              aria-label="Reps"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <input
                className={inputClass}
                placeholder={`Load (${defaultUnit})`}
                aria-label="Load"
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Reps (optional)"
                aria-label="Reps"
                inputMode="numeric"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
              />
            </div>
          )}

          <input
            className={inputClass}
            type="date"
            aria-label="Date achieved"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {error && <p className="text-signal text-xs">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="tap press h-12 w-full bg-bone text-obsidian font-display text-[11px] uppercase tracking-[0.28em] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save personal best"}
          </button>
        </form>
      )}
    </Sheet>
  );
}