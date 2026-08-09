import { useEffect, useRef, useState } from "react";

/**
 * Camera barcode scanner. Uses the native BarcodeDetector where available
 * (fast, no download) and falls back to ZXing on iOS Safari and older browsers.
 */
export function BarcodeScanner({ onDetected, onError }: { onDetected: (code: string) => void; onError?: (msg: string) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState("Starting camera…");
  const doneRef = useRef(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let controls: { stop: () => void } | null = null;
    let cancelled = false;

    const finish = (code: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      onDetected(code.replace(/\D/g, ""));
    };

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStatus("Point at the barcode");

        const Detector = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => { detect: (s: CanvasImageSource) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;

        if (Detector) {
          const detector = new Detector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"] });
          const tick = async () => {
            if (cancelled || doneRef.current || !videoRef.current) return;
            try {
              const hits = await detector.detect(videoRef.current);
              if (hits[0]?.rawValue) return finish(hits[0].rawValue);
            } catch { /* frame not ready */ }
            raf = requestAnimationFrame(() => void tick());
          };
          raf = requestAnimationFrame(() => void tick());
          return;
        }

        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        if (cancelled || !videoRef.current) return;
        const reader = new BrowserMultiFormatReader();
        controls = await reader.decodeFromVideoElement(videoRef.current, (result) => {
          const text = result?.getText();
          if (text) finish(text);
        });
      } catch {
        if (!cancelled) {
          setStatus("Camera unavailable");
          onError?.("Camera unavailable — allow camera access or use search instead.");
        }
      }
    };

    void start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      controls?.stop();
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onDetected, onError]);

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden border border-border/60 bg-obsidian aspect-[4/3]">
        <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-x-8 top-1/2 -translate-y-1/2 h-24 border-2 border-bone/70" />
      </div>
      <p className="text-foreground-muted text-xs text-center">{status}</p>
    </div>
  );
}