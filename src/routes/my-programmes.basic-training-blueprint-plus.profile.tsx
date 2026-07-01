import { createFileRoute } from "@tanstack/react-router";
import { BtbShell } from "@/components/btb/BtbShell";
import { btbStore, useBtbProfile, type BtbUnits, type BtbExperience, type BtbEquipment } from "@/lib/btb/store";
import { useAuth } from "@/lib/useAuth";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/my-programmes/basic-training-blueprint-plus/profile")({
  head: () => ({ meta: [{ title: "Basic Training Blueprint+ — Profile" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ProfilePage,
});

function safeNum(v: string, max = 1000): number | null {
  if (!v.trim()) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > max) return null;
  return Math.round(n * 10) / 10;
}
function safeInt(v: string, min: number, max: number): number | null {
  if (!v.trim()) return null;
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}
function safeTime(v: string): string | null {
  const t = v.trim();
  if (!t) return null;
  return /^\d{1,2}:\d{2}$/.test(t) ? t : null;
}
function safeDate(v: string): string | null {
  if (!v) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

const ROLES = [
  "",
  "Infantry Soldier (Regular)",
  "Infantry Soldier (Reserve)",
  "Paratrooper",
  "Emergency service",
  "General preparation",
];

function ProfilePage() {
  const { user } = useAuth();
  const profile = useBtbProfile();
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!form.displayName && user?.user_metadata?.display_name) {
      setForm((f) => ({ ...f, displayName: user.user_metadata.display_name as string }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    btbStore.saveProfile({ ...form, setupComplete: true });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <BtbShell eyebrow="You" title="Profile">
      <form onSubmit={save} className="grid lg:grid-cols-2 gap-x-10 gap-y-6 max-w-3xl">
        <Field label="Display name">
          <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value.slice(0, 40) })} className="btb-input" placeholder="How we greet you" />
        </Field>
        <Field label="Units">
          <select value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value as BtbUnits })} className="btb-input">
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </select>
        </Field>
        <Field label="Start date">
          <input type="date" value={form.startDate ?? ""} onChange={(e) => setForm({ ...form, startDate: safeDate(e.target.value) })} className="btb-input" />
        </Field>
        <Field label="Assessment date (optional)">
          <input type="date" value={form.assessmentDate ?? ""} onChange={(e) => setForm({ ...form, assessmentDate: safeDate(e.target.value) })} className="btb-input" />
        </Field>
        <Field label="Role / target">
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="btb-input">
            {ROLES.map((r) => <option key={r} value={r}>{r || "Select"}</option>)}
          </select>
        </Field>
        <Field label="Running experience">
          <select value={form.runningExperience} onChange={(e) => setForm({ ...form, runningExperience: e.target.value as BtbExperience })} className="btb-input">
            <option value="">Select</option>
            <option value="New">New</option>
            <option value="Some">Some</option>
            <option value="Experienced">Experienced</option>
          </select>
        </Field>
        <Field label="Current 2 km (mm:ss)">
          <input value={form.currentTwoKm ?? ""} onChange={(e) => setForm({ ...form, currentTwoKm: safeTime(e.target.value) })} className="btb-input" placeholder="e.g. 10:30" />
        </Field>
        <Field label={`Deadlift baseline (${form.units})`}>
          <input value={form.deadliftBaseline?.toString() ?? ""} onChange={(e) => setForm({ ...form, deadliftBaseline: safeNum(e.target.value, 500) })} className="btb-input" placeholder="0" />
        </Field>
        <Field label="Seated med-ball throw (m)">
          <input value={form.medicineBallBaseline?.toString() ?? ""} onChange={(e) => setForm({ ...form, medicineBallBaseline: safeNum(e.target.value, 10) })} className="btb-input" placeholder="0" />
        </Field>
        <Field label="Available training days">
          <input value={form.availableDays?.toString() ?? ""} onChange={(e) => setForm({ ...form, availableDays: safeInt(e.target.value, 3, 6) })} className="btb-input" placeholder="3-6" />
        </Field>
        <Field label="Equipment access">
          <select value={form.equipmentLevel} onChange={(e) => setForm({ ...form, equipmentLevel: e.target.value as BtbEquipment })} className="btb-input">
            <option value="">Select</option>
            <option value="Gym">Full gym</option>
            <option value="Home + kit">Home + basic kit</option>
            <option value="Minimal">Minimal</option>
          </select>
        </Field>
        <Field label="Movement limitations / substitutions" full>
          <textarea value={form.substitutions} onChange={(e) => setForm({ ...form, substitutions: e.target.value.slice(0, 1000) })} className="btb-input" style={{ minHeight: 80 }} maxLength={1000} placeholder="e.g. Sub trap-bar deadlift for kettlebell deadlift" />
        </Field>

        <div className="lg:col-span-2 flex items-center gap-4">
          <button type="submit" className="h-11 px-6 inline-flex items-center bg-signal text-bone text-[11px] uppercase tracking-[0.28em] font-display">Save profile</button>
          {saved && <span className="text-signal text-xs uppercase tracking-widest">Saved</span>}
        </div>
      </form>

      <style>{`.btb-input{height:2.75rem;background:transparent;border:1px solid hsl(var(--border));padding:0 .75rem;color:hsl(var(--bone));width:100%;font-family:inherit}`}</style>
    </BtbShell>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "lg:col-span-2" : ""}`}>
      <span className="eyebrow text-foreground-muted">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}