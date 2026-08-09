import { useState, useCallback } from "react";

/**
 * Keeps the raw text a user typed in local state so controlled inputs never
 * discard partial input (e.g. "10:" on the way to "10:30"). Values are parsed
 * and committed to the underlying store on blur / save, not on every keystroke.
 */
export function useDraftFields() {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const valueOf = useCallback(
    (key: string, stored: unknown) => (key in draft ? draft[key] : stored == null ? "" : String(stored)),
    [draft],
  );

  const setDraftValue = useCallback((key: string, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
  }, []);

  const clearDraft = useCallback((key: string) => {
    setDraft((d) => {
      if (!(key in d)) return d;
      const next = { ...d };
      delete next[key];
      return next;
    });
  }, []);

  const setError = useCallback((key: string, message: string | null) => {
    setErrors((e) => {
      if (!message) {
        if (!(key in e)) return e;
        const next = { ...e };
        delete next[key];
        return next;
      }
      return { ...e, [key]: message };
    });
  }, []);

  return { draft, errors, valueOf, setDraftValue, clearDraft, setError };
}

export function parseNumberField(raw: string, max: number): { value: number | null; error: string | null } {
  const t = raw.trim();
  if (!t) return { value: null, error: null };
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return { value: null, error: "Enter a number" };
  if (n > max) return { value: null, error: `Max ${max}` };
  return { value: Math.round(n * 10) / 10, error: null };
}

export function parseIntField(raw: string, min: number, max: number): { value: number | null; error: string | null } {
  const t = raw.trim();
  if (!t) return { value: null, error: null };
  const n = parseInt(t, 10);
  if (!Number.isFinite(n)) return { value: null, error: "Enter a number" };
  if (n < min || n > max) return { value: null, error: `Enter ${min}-${max}` };
  return { value: n, error: null };
}

export function parseTimeField(raw: string): { value: string | null; error: string | null } {
  const t = raw.trim();
  if (!t) return { value: null, error: null };
  if (!/^\d{1,3}:[0-5]\d$/.test(t)) return { value: null, error: "Use mm:ss, e.g. 10:30" };
  return { value: t, error: null };
}
