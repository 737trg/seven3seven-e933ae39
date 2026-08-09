import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

const DISMISS_KEY = "s37.install.dismissed";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** True in the Lovable editor preview or an embedded frame, where an install banner is noise. */
function suppressedContext() {
  if (typeof window === "undefined") return true;
  if (window.top !== window.self) return true;
  const h = window.location.hostname;
  return (
    h.startsWith("id-preview--") ||
    h.startsWith("preview--") ||
    h.endsWith("lovableproject.com") ||
    h.endsWith("lovable.app") === false && h === "localhost"
  );
}

function isStandalone() {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

/**
 * Invites athletes to keep SEVEN3SEVEN on their home screen once they've
 * shown intent (two sessions logged). Chrome/Android gets the real install
 * prompt; iOS Safari gets the Share-sheet instructions, since it has no
 * `beforeinstallprompt`.
 */
export function InstallPrompt({ sessionsCompleted }: { sessionsCompleted: number }) {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (sessionsCompleted < 2) return;
    if (isStandalone() || suppressedContext()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua);
    if (ios) {
      setIosHint(true);
      setVisible(true);
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, [sessionsCompleted]);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => null);
    dismiss();
  };

  return (
    <div className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-5 md:left-auto md:right-5 md:w-[22rem] z-40 border border-border bg-surface elevate p-4">
      <div className="flex items-start gap-3">
        <Download className="h-5 w-5 text-signal shrink-0 mt-0.5" strokeWidth={1.5} />
        <div className="min-w-0">
          <p className="font-display text-bone uppercase text-[11px] tracking-[0.22em]">Keep it on your home screen</p>
          <p className="body-sm mt-1.5">
            {iosHint ? (
              <>
                Tap <Share className="inline h-3.5 w-3.5 align-[-2px]" strokeWidth={1.5} /> Share, then
                {" "}<span className="text-bone">Add to Home Screen</span>.
              </>
            ) : (
              "One tap to your next session — no browser, no searching."
            )}
          </p>
          {!iosHint && (
            <button
              type="button"
              onClick={() => void install()}
              className="tap press mt-3 h-10 px-4 bg-bone text-obsidian font-display text-[10px] uppercase tracking-[0.24em]"
            >
              Install
            </button>
          )}
        </div>
        <button type="button" aria-label="Dismiss" onClick={dismiss} className="tap press ml-auto text-foreground-muted hover:text-bone">
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}