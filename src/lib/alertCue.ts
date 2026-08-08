/**
 * Small audio + haptic cue used by workout timers.
 * Web Audio is created lazily on first use so it survives autoplay policies
 * (by then the athlete has already tapped Start).
 */
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx ??= new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, startAt: number, durationSec: number, gainValue: number) {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, audio.currentTime + startAt);
  gain.gain.linearRampToValueAtTime(gainValue, audio.currentTime + startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + startAt + durationSec);
  osc.connect(gain).connect(audio.destination);
  osc.start(audio.currentTime + startAt);
  osc.stop(audio.currentTime + startAt + durationSec + 0.02);
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined") return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}

/** Short tick for the final seconds of a countdown. */
export function cueTick() {
  tone(880, 0, 0.08, 0.12);
}

/** Longer double tone when a timer reaches zero. */
export function cueEnd() {
  tone(660, 0, 0.18, 0.2);
  tone(990, 0.2, 0.28, 0.2);
  vibrate([120, 80, 200]);
}

/** Single tone on each EMOM / interval boundary. */
export function cueRound() {
  tone(760, 0, 0.12, 0.16);
  vibrate(80);
}

/** Warm-up the audio context from a user gesture. */
export function primeAudio() {
  getCtx();
}
