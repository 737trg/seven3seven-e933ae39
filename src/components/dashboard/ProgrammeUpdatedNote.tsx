import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { X } from "lucide-react";

/**
 * One-time note shown after a programme's content has been refreshed.
 * Dismissal is stored on the athlete's enrolment (`state.notices`) so it
 * follows them across devices, with a local fallback when no enrolment row
 * exists yet.
 */
export function ProgrammeUpdatedNote({ slug, noticeKey }: { slug: string; noticeKey: string }) {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [enrolmentId, setEnrolmentId] = useState<string | null>(null);
  const [state, setState] = useState<Record<string, unknown>>({});
  const localKey = `s737.notice.${slug}.${noticeKey}`;

  useEffect(() => {
    let cancelled = false;
    if (typeof window !== "undefined" && window.localStorage.getItem(localKey) === "1") return;
    if (!user?.id) return;

    (async () => {
      const { data: product } = await supabase.from("products").select("id").eq("slug", slug).maybeSingle();
      if (!product) return;
      const { data: enrolment } = await supabase
        .from("programme_enrolments")
        .select("id, state")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .maybeSingle();
      if (cancelled) return;
      const st = (enrolment?.state as Record<string, unknown> | null) ?? {};
      const notices = (st.notices as Record<string, boolean> | undefined) ?? {};
      if (notices[noticeKey]) return;
      setEnrolmentId(enrolment?.id ?? null);
      setState(st);
      setVisible(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, slug, noticeKey, localKey]);

  if (!visible) return null;

  const dismiss = async () => {
    setVisible(false);
    if (typeof window !== "undefined") window.localStorage.setItem(localKey, "1");
    if (!enrolmentId) return;
    const notices = { ...((state.notices as Record<string, boolean> | undefined) ?? {}), [noticeKey]: true };
    await supabase.from("programme_enrolments").update({ state: { ...state, notices } }).eq("id", enrolmentId);
  };

  return (
    <div className="mb-8 border border-border bg-surface/60 p-5 relative">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 text-foreground-muted hover:text-bone"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="eyebrow mb-1">Programme updated</p>
      <p className="text-bone text-sm max-w-[62ch]">
        This plan has been refreshed with the latest coaching. Everything you've already completed has carried
        over — your sessions, logged results, streak and personal bests are all intact.
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="mt-4 h-9 px-5 inline-flex items-center border border-border text-bone text-[10px] uppercase tracking-[0.24em] font-display"
      >
        Got it
      </button>
    </div>
  );
}