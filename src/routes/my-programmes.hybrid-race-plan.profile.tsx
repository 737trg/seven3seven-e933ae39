import { createFileRoute } from "@tanstack/react-router";
import { HrpShell } from "@/components/hrp/HrpShell";
import { hrpStore, useHrpProfile, type HrpUnits, type HrpFormat, type HrpCategory, type HrpSex, type HrpTrack } from "@/lib/hrp/store";
import { useAuth } from "@/lib/useAuth";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/my-programmes/hybrid-race-plan/profile")({
  head: () => ({ meta: [{ title: "HYBRID RACE PLAN — Profile" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ProfilePage,
});

function safeNum(v: string, max = 1000): number | null {
  if (!v.trim()) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > max) return null;
  return Math.round(n * 10) / 10;
}

function ProfilePage() {
  const { user } = useAuth();
  const profile = useHrpProfile();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile.displayName && user?.user_metadata?.display_name) {
      hrpStore.saveProfile({ displayName: String(user.user_metadata.display_name) });
    }
  }, [user, profile.displayName]);

  function field<K extends keyof typeof profile>(k: K, label: string, type: "text" | "date" | "number" = "text", placeholder?: string) {
    return (
      <label className="grid grid-cols-[180px_1fr] items-center gap-3 text-sm">
        <span className="text-foreground-muted uppercase tracking-widest text-[10px]">{label}</span>
        <input
          type={type}
          value={(profile[k] as any) ?? ""}
          placeholder={placeholder}
          maxLength={80}
          onChange={(e) => {
            const v = e.target.value;
            if (type === "number") {
              const n = safeNum(v);
              hrpStore.saveProfile({ [k]: n } as any);
            } else {
              hrpStore.saveProfile({ [k]: v.slice(0, 80) } as any);
            }
          }}
          className="h-10 bg-transparent border border-border px-3 text-bone tabular"
        />
      </label>
    );
  }

  function select<K extends keyof typeof profile>(k: K, label: string, options: string[]) {
    return (
      <label className="grid grid-cols-[180px_1fr] items-center gap-3 text-sm">
        <span className="text-foreground-muted uppercase tracking-widest text-[10px]">{label}</span>
        <select value={(profile[k] as any) ?? ""} onChange={(e) => hrpStore.saveProfile({ [k]: e.target.value } as any)}
          className="h-10 bg-transparent border border-border px-3 text-bone">
          {options.map((o) => <option key={o} value={o} className="bg-background text-bone">{o || "—"}</option>)}
        </select>
      </label>
    );
  }

  return (
    <HrpShell eyebrow="Your profile" title="Profile">
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-4 max-w-4xl">
        {field("displayName", "Display name")}
        {select<"units">("units", "Units", ["kg", "lb"] satisfies HrpUnits[])}
        {field("startDate", "Programme start", "date")}
        {field("competitionDate", "Competition date", "date")}
        {select<"format">("format", "Format", ["Individual", "Pairs"] satisfies HrpFormat[])}
        {select<"category">("category", "Category", ["", "ATHX", "ATHX Pro"] satisfies HrpCategory[])}
        {select<"sex">("sex", "Sex", ["", "Male", "Female"] satisfies HrpSex[])}
        {select<"mode">("mode", "Training mode", ["five", "six"] satisfies HrpTrack[])}
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
          onClick={() => { hrpStore.saveProfile({ setupComplete: true }); setSaved(true); setTimeout(() => setSaved(false), 1600); }}
          className="h-11 px-6 bg-signal text-bone text-[11px] uppercase tracking-[0.28em] font-display"
        >
          Save profile
        </button>
        {saved && <span className="self-center text-foreground-muted text-xs">Saved.</span>}
      </div>
      <p className="text-foreground-muted text-xs mt-8 max-w-[60ch]">
        HYBRID RACE PLAN does not collect Olympic-lifting benchmarks. Pairs mode only changes the Race day tools — it does not alter the training programme.
      </p>
    </HrpShell>
  );
}