// Small synthesised sound effects (Web Audio, no audio files). On by default, with a mute toggle.

let ctx: AudioContext | null = null;
let enabled = false;

export function setSoundEnabled(on: boolean): void {
  enabled = on;
}

/**
 * The shared audio context, created on first use. Browsers only allow sound after the visitor
 * interacts with the page, and every sound here plays from a click or tap, so resuming here works.
 */
function audio(): AudioContext | null {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function noiseBuffer(ac: AudioContext, seconds: number): AudioBuffer {
  const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * seconds), ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

/** Filtered noise burst with an attack/decay envelope. */
function burst(opts: { duration: number; type: BiquadFilterType; freq: number; freqEnd?: number; q?: number; gain: number; attack?: number }) {
  const ac = audio();
  if (!ac || !enabled) return;
  const t = ac.currentTime;
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac, opts.duration);
  const filter = ac.createBiquadFilter();
  filter.type = opts.type;
  filter.Q.value = opts.q ?? 1;
  filter.frequency.setValueAtTime(opts.freq, t);
  if (opts.freqEnd) filter.frequency.exponentialRampToValueAtTime(opts.freqEnd, t + opts.duration);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(opts.gain, t + (opts.attack ?? 0.005));
  g.gain.exponentialRampToValueAtTime(0.0001, t + opts.duration);
  src.connect(filter).connect(g).connect(ac.destination);
  src.start(t);
}

function thump(freq: number, duration: number, gain: number) {
  const ac = audio();
  if (!ac || !enabled) return;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + duration);
  const g = ac.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration);
}

export const sounds = {
  /** Wooden block meeting paper: a soft low knock. */
  press() {
    thump(110, 0.14, 0.35);
    burst({ duration: 0.08, type: 'lowpass', freq: 900, gain: 0.25 });
  },
  /** Block dabbed on the felt pad: a short, damp pat. */
  ink() {
    burst({ duration: 0.12, type: 'bandpass', freq: 500, freqEnd: 250, q: 2, gain: 0.3 });
  },
  /** Washing off: a slow watery swish. */
  wash() {
    burst({ duration: 0.8, type: 'bandpass', freq: 1800, freqEnd: 500, q: 0.8, gain: 0.18, attack: 0.25 });
  },
  /** A sheet of paper sliding across the table. */
  slide() {
    burst({ duration: 0.45, type: 'highpass', freq: 2500, freqEnd: 1200, gain: 0.08, attack: 0.1 });
  },
};
