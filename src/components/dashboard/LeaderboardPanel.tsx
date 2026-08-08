import { useCallback, useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  user_id: string;
  display_name: string;
  sessions_completed: number;
  total_seconds: number;
  is_me: boolean;
};

function monthStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
}

/**
 * Monthly consistency board. Ranked purely on sessions the app recorded —
 * no self-reported numbers, so nothing needs manual validation.
 */
export function LeaderboardPanel({ userId }: { userId: string | undefined }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [optedIn, setOptedIn] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const [prefRes, boardRes] = await Promise.all([
      supabase
        .from("user_preferences")
        .select("leaderboard_opt_in, leaderboard_name")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase.rpc("monthly_leaderboard", { _month_start: monthStart() }),
    ]);
    setOptedIn(!!prefRes.data?.leaderboard_opt_in);
    setName(prefRes.data?.leaderboard_name ?? "");
    setRows(((boardRes.data as Row[] | null) ?? []).slice(0, 10));
    setLoading(false);
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  async function join(next: boolean) {
    if (!userId) return;
    setSaving(true);
    await supabase.from("user_preferences").upsert(
      {
        user_id: userId,
        leaderboard_opt_in: next,
        leaderboard_name: name.trim() || "Athlete",
      },
      { onConflict: "user_id" },
    );
    setOptedIn(next);
    setSaving(false);
    void load();
  }

  if (loading) return <div className="h-24 hairline bg-surface/20 animate-pulse" aria-hidden />;

  return (
    <div className="space-y-4">
      <p className="body-sm">
        Ranked on sessions completed this month, recorded by the app.
      </p>

      {rows.length === 0 ? (
        <p className="text-foreground-muted text-xs uppercase tracking-[0.2em]">No entries this month yet.</p>
      ) : (
        <ol className="space-y-2">
          {rows.map((row, i) => (
            <li
              key={row.user_id}
              className={`flex items-center gap-3 text-xs ${row.is_me ? "text-signal" : "text-bone"}`}
            >
              <span className="tabular w-5 text-foreground-muted">{i + 1}</span>
              {i === 0 && <Trophy className="h-3.5 w-3.5 text-signal shrink-0" />}
              <span className="min-w-0 flex-1 truncate">{row.is_me ? "You" : row.display_name}</span>
              <span className="tabular">{row.sessions_completed}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="pt-3 border-t border-border/60 space-y-3">
        {optedIn ? (
          <button
            onClick={() => join(false)}
            disabled={saving}
            className="press eyebrow text-foreground-muted hover:text-bone"
          >
            Leave the board
          </button>
        ) : (
          <>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 24))}
              placeholder="Display name"
              className="w-full h-11 px-3 bg-transparent border border-border text-bone text-sm placeholder:text-foreground-muted focus:border-bone outline-none"
            />
            <button
              onClick={() => join(true)}
              disabled={saving}
              className="press h-11 px-5 inline-flex items-center bg-signal text-bone text-[11px] uppercase tracking-[0.28em] font-display"
            >
              Join the board
            </button>
          </>
        )}
      </div>
    </div>
  );
}