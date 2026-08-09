import { createFileRoute } from "@tanstack/react-router";
import { SemShell } from "@/components/sem/SemShell";
import { semStore, useSemProfile, type SemUnits, type SemFormat, type SemCategory, type SemSex, type SemMode } from "@/lib/sem/store";
import { useAuth } from "@/lib/useAuth";
import { useState, useEffect } from "react";
import { useDraftFields, parseNumberField } from "@/lib/useDraftFields";
import pdfAsset from "@/assets/sem-2026-download.pdf.asset.json";
import { PdfDownloadLink } from "@/components/dashboard/PdfDownloadLink";

export const Route = createFileRoute("/my-programmes/sem-2026/profile")({
  head: () => ({ meta: [{ title: "S.E.M 2026 — Profile" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const profile = useSemProfile();
  const [saved, setSaved] = useState(false);
  const { errors, valueOf, setDraftValue, clearDraft, setError } = useDraftFields();

  useEffect(() => {
    if (!profile.displayName && user?.user_metadata?.display_name) {
      semStore.saveProfile({ displayName: String(user.user_metadata.display_name) });
    }
  }, [user, profile.displayName]);

  function field<K extends keyof typeof profile>(k: K, label: string, type: "text" | "date" | "number" = "text", placeholder?: string) {
    const key = String(k);
    const commit = () => {
      const raw = valueOf(key, profile[k]);
      if (type === "number") {
        const { value, error } = parseNumberField(raw, 1000);
        setError(key, error);
        if (error) return;
        semStore.saveProfile({ [k]: value } as any);
      } else {
        semStore.saveProfile({ [k]: raw.slice(0, 80) } as any);
      }
      clearDraft(key);
    };
    return (
      <label className="grid grid-cols-[180px_1fr] items-center gap-3 text-sm">
        <span className="text-foreground-muted uppercase tracking-widest text-[10px]">{label}</span>
        <span className="block">
        <input
          type={type === "number" ? "text" : type}
          inputMode={type === "number" ? "decimal" : undefined}
          value={type === "date" ? ((profile[k] as any) ?? "") : valueOf(key, profile[k])}
          placeholder={placeholder}
          maxLength={80}
          onChange={(e) => {
            if (type === "date") { semStore.saveProfile({ [k]: e.target.value } as any); return; }
            setDraftValue(key, e.target.value);
          }}
          onBlur={type === "date" ? undefined : commit}
          className="h-10 w-full bg-transparent border border-border px-3 text-bone tabular"
        />
        {errors[key] && <span className="mt-1 block text-signal text-[11px]">{errors[key]}</span>}
        </span>
      </label>
    );
  }

  function select<K extends keyof typeof profile>(k: K, label: string, options: string[]) {
    return (
      <label className="grid grid-cols-[180px_1fr] items-center gap-3 text-sm">
        <span className="text-foreground-muted uppercase tracking-widest text-[10px]">{label}</span>
        <select value={(profile[k] as any) ?? ""} onChange={(e) => semStore.saveProfile({ [k]: e.target.value } as any)}
          className="h-10 bg-transparent border border-border px-3 text-bone">
          {options.map((o) => <option key={o} value={o} className="bg-background text-bone">{o || "—"}</option>)}
        </select>
      </label>
    );
  }

  return (
    <SemShell eyebrow="Your profile" title="Profile">
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-4 max-w-4xl">
        {field("displayName", "Display name")}
        {select<"units">("units", "Units", ["kg", "lb"] satisfies SemUnits[])}
        {field("startDate", "Programme start", "date")}
        {field("competitionDate", "Competition date", "date")}
        {select<"format">("format", "Format", ["Individual", "Pairs"] satisfies SemFormat[])}
        {select<"category">("category", "Category", ["", "ATHX", "ATHX Pro"] satisfies SemCategory[])}
        {select<"sex">("sex", "Sex", ["", "Male", "Female"] satisfies SemSex[])}
        {select<"mode">("mode", "Training mode", ["five", "six"] satisfies SemMode[])}
        {field("strictPress", "Strict press 1RM", "number", "0")}
        {field("backSquat", "Back squat 1RM", "number", "0")}
        {field("deadlift", "Deadlift 1RM", "number", "0")}
        {field("fiveK", "5km time", "text", "mm:ss")}
        {field("tenK", "10km time", "text", "mm:ss")}
        {field("row500", "500m row", "text", "mm:ss")}
        {field("workingDb", "Working dumbbell", "number", "0")}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => { semStore.saveProfile({ setupComplete: true }); setSaved(true); setTimeout(() => setSaved(false), 1600); }}
          className="h-11 px-6 bg-signal text-bone text-[11px] uppercase tracking-[0.28em] font-display"
        >
          Save profile
        </button>
        {saved && <span className="self-center text-foreground-muted text-xs">Saved.</span>}
      </div>
      <p className="text-foreground-muted text-xs mt-8 max-w-[60ch]">
        S.E.M 2026 does not collect Olympic-lifting benchmarks. Pairs mode only changes the Race day tools — it does not alter the training programme.
      </p>
      <div className="mt-10 border-t border-border pt-6">
        <p className="eyebrow mb-3">Programme download</p>
        <PdfDownloadLink
          slug="sem-2026"
          href={pdfAsset.url}
          label="S.E.M 2026 PDF"
          className="inline-flex items-center gap-2 h-11 px-5 border border-border text-bone text-[11px] uppercase tracking-[0.28em] font-display hover:border-bone"
        />
        <p className="text-foreground-muted text-xs mt-3 max-w-[60ch]">
          The PDF is the printable reference. The app is the guided version — use it in the gym.
        </p>
      </div>
    </SemShell>
  );
}