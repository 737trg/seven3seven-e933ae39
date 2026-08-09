import { createClient } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";

/**
 * Scheduled notification job. Runs hourly and decides, per athlete, whether a
 * daily reminder, weekly recap or streak-rescue email is due right now.
 * Emails are handed to the app's email queue, which handles retries.
 */

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

type Prefs = {
  user_id: string;
  training_days: string[] | null;
  settings: { notifications?: Record<string, unknown> } | null;
};

function notif(p: Prefs) {
  const n = (p.settings?.notifications ?? {}) as Record<string, unknown>;
  return {
    daily: n["daily_reminder"] !== false,
    time: typeof n["reminder_time"] === "string" ? (n["reminder_time"] as string) : "07:00",
    recap: n["weekly_recap"] !== false,
    rescue: n["streak_rescue"] !== false,
  };
}

function dayStart(offsetDays: number) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d;
}

export const Route = createFileRoute("/api/public/hooks/notifications")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"];
        const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        const apiKey = request.headers.get("apikey");
        if (!apiKey || apiKey !== import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = createClient(supabaseUrl, serviceKey);
        const now = new Date();
        const hour = now.getUTCHours();
        const todayKey = DAY_KEYS[now.getUTCDay()]!;
        const isMonday = now.getUTCDay() === 1;

        const { data: prefsRows, error: prefsError } = await supabase
          .from("user_preferences")
          .select("user_id, training_days, settings");
        if (prefsError) {
          console.error("Failed to load preferences", prefsError);
          return Response.json({ error: "Failed to load preferences" }, { status: 500 });
        }

        const prefs = (prefsRows ?? []) as Prefs[];
        if (prefs.length === 0) return Response.json({ sent: 0 });

        const userIds = prefs.map((p) => p.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, first_name, display_name")
          .in("id", userIds);
        const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

        const { data: completions } = await supabase
          .from("session_completions")
          .select("user_id, completed_at")
          .in("user_id", userIds)
          .gte("completed_at", dayStart(-30).toISOString());

        const lastByUser = new Map<string, Date>();
        const weekCountByUser = new Map<string, number>();
        const todayByUser = new Set<string>();
        const weekStart = dayStart(-7);
        const today0 = dayStart(0);
        for (const c of completions ?? []) {
          const at = new Date(c.completed_at as string);
          const prev = lastByUser.get(c.user_id as string);
          if (!prev || at > prev) lastByUser.set(c.user_id as string, at);
          if (at >= weekStart) weekCountByUser.set(c.user_id as string, (weekCountByUser.get(c.user_id as string) ?? 0) + 1);
          if (at >= today0) todayByUser.add(c.user_id as string);
        }

        const origin = new URL(request.url).origin;
        const queue: Array<{ templateName: string; recipientEmail: string; idempotencyKey: string; templateData: Record<string, unknown> }> = [];
        const stamp = today0.toISOString().slice(0, 10);

        for (const p of prefs) {
          const profile = profileById.get(p.user_id);
          const email = profile?.email;
          if (!email) continue;
          const firstName = profile?.first_name || (profile?.display_name ?? "").split(" ")[0] || undefined;
          const settings = notif(p);
          const last = lastByUser.get(p.user_id);
          const daysSince = last ? Math.floor((today0.getTime() - new Date(last).setUTCHours(0, 0, 0, 0)) / 86400000) : null;

          // Daily reminder — at the athlete's chosen hour, on a training day, if nothing logged yet.
          const prefHour = Number((settings.time || "07:00").split(":")[0]);
          const trainsToday = !p.training_days?.length || p.training_days.includes(todayKey);
          if (settings.daily && prefHour === hour && trainsToday && !todayByUser.has(p.user_id)) {
            queue.push({
              templateName: "daily-reminder",
              recipientEmail: email,
              idempotencyKey: `daily-${p.user_id}-${stamp}`,
              templateData: { firstName },
            });
          }

          // Weekly recap — Monday 08:00 UTC.
          if (settings.recap && isMonday && hour === 8) {
            queue.push({
              templateName: "weekly-recap",
              recipientEmail: email,
              idempotencyKey: `recap-${p.user_id}-${stamp}`,
              templateData: {
                firstName,
                sessionsCompleted: weekCountByUser.get(p.user_id) ?? 0,
                sessionsPlanned: p.training_days?.length || 0,
                streakDays: daysSince === 0 ? 1 : 0,
                newPbs: 0,
              },
            });
          }

          // Streak rescue — once, exactly 5 quiet days, at 10:00 UTC.
          if (settings.rescue && hour === 10 && daysSince === 5) {
            queue.push({
              templateName: "streak-rescue",
              recipientEmail: email,
              idempotencyKey: `rescue-${p.user_id}-${stamp}`,
              templateData: { firstName, daysSinceLastSession: 5 },
            });
          }
        }

        let sent = 0;
        for (const job of queue) {
          try {
            const res = await fetch(`${origin}/lovable/email/transactional/send`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
              body: JSON.stringify(job),
            });
            if (res.ok) sent += 1;
          } catch (err) {
            console.error("Notification send failed", { template: job.templateName, err });
          }
        }

        return Response.json({ queued: queue.length, sent });
      },
    },
  },
});
