import { MUSIC } from '../config/music';

/**
 * One shared audio engine for the whole universe.
 *  - background music runs on its own bus and never restarts between scenes
 *  - interactive sounds are synthesized live (all original, no samples)
 *  - music ducks under important sounds, and "opens up" in World Two
 */

export const midi = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/** D dorian, the house scale of this universe. */
export const SCALE = [62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81];

const PAD_W1 = [
  [50, 57, 64, 65],
  [46, 57, 62, 64],
  [53, 57, 60, 67],
  [48, 55, 62, 64],
];
const PAD_W2 = [
  [55, 62, 66, 69],
  [50, 57, 64, 66],
  [47, 54, 62, 64],
  [45, 57, 59, 64],
];

type AudioCtor = typeof AudioContext;

class Engine {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private music!: GainNode;
  private musicFilter!: BiquadFilterNode;
  private sfx!: GainNode;
  private verbSend!: GainNode;
  private padFilter!: BiquadFilterNode;
  private el: HTMLAudioElement | null = null;
  private elRouted = false;
  private noise: AudioBuffer | null = null;
  private padOn = false;
  private padTimer: number | null = null;
  private twinkleTimer: number | null = null;
  private padIndex = 0;
  private duckTimer: number | null = null;
  private musicLevel = 0;
  private begun = false;
  private unlocked = false;
  world: 1 | 2 = 1;
  muted = false;
  private listeners = new Set<() => void>();

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
  private emit() {
    this.listeners.forEach((f) => f());
  }

  /** Must be called from inside a user gesture (touch / click / key). */
  unlock() {
    try {
      const nav = navigator as Navigator & { audioSession?: { type: string } };
      if (nav.audioSession) nav.audioSession.type = 'playback'; // play even with the iPhone silent switch on
    } catch {
      /* ignore */
    }
    if (!this.ctx) this.init();
    const ctx = this.ctx;
    if (!ctx) return;
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    if (!this.unlocked) {
      this.unlocked = true;
      // iOS: start the media element inside the gesture, silently, so it can fade in later.
      this.prepareElement();
      // tiny silent buffer, the classic iOS unlock
      const b = ctx.createBuffer(1, 1, 22050);
      const s = ctx.createBufferSource();
      s.buffer = b;
      s.connect(ctx.destination);
      s.start(0);
    } else if (this.el && this.el.paused && this.begun && document.visibilityState === 'visible') {
      this.el.play().catch(() => {});
    }
  }

  private init() {
    const AC: AudioCtor | undefined =
      window.AudioContext || (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.master.connect(ctx.destination);

    this.musicFilter = ctx.createBiquadFilter();
    this.musicFilter.type = 'lowpass';
    this.musicFilter.frequency.value = 7000;
    this.musicFilter.Q.value = 0.4;
    this.music = ctx.createGain();
    this.music.gain.value = 0;
    this.music.connect(this.musicFilter);
    this.musicFilter.connect(this.master);

    this.padFilter = ctx.createBiquadFilter();
    this.padFilter.type = 'lowpass';
    this.padFilter.frequency.value = 1100;
    this.padFilter.connect(this.music);

    this.sfx = ctx.createGain();
    this.sfx.gain.value = 0.9;
    this.sfx.connect(this.master);

    const verb = ctx.createConvolver();
    verb.buffer = this.impulse(2.6);
    this.verbSend = ctx.createGain();
    this.verbSend.gain.value = 0.32;
    this.verbSend.connect(verb);
    verb.connect(this.master);
    this.sfx.connect(this.verbSend);
    this.padFilter.connect(this.verbSend);

    const n = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.noise = n;

    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.visibilityState === 'hidden') {
        this.el?.pause();
        this.ctx.suspend().catch(() => {});
      } else {
        this.ctx.resume().catch(() => {});
        if (this.el && this.begun) this.el.play().catch(() => {});
      }
    });
  }

  private impulse(seconds: number) {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    return buf;
  }

  private prepareElement() {
    if (!MUSIC.file || this.el) return;
    const el = new Audio();
    el.src = import.meta.env.BASE_URL + MUSIC.file;
    el.loop = MUSIC.loop;
    el.preload = 'auto';
    el.setAttribute('playsinline', '');
    el.addEventListener(
      'error',
      () => {
        this.el = null;
        if (this.begun) this.startPad();
      },
      { once: true },
    );
    try {
      const src = this.ctx!.createMediaElementSource(el);
      src.connect(this.music);
      this.elRouted = true;
    } catch {
      this.elRouted = false;
    }
    this.el = el;
    if (this.elRouted) el.play().catch(() => {});
  }

  /** Fade the soundtrack in. Safe to call more than once. */
  beginMusic() {
    if (!this.ctx || this.begun) return;
    this.begun = true;
    if (this.el) {
      try {
        this.el.currentTime = 0;
      } catch {
        /* ignore */
      }
      if (!this.elRouted) this.el.volume = this.muted ? 0 : MUSIC.volume;
      this.el.play().catch(() => {
        // could not play (missing file / format) → generated ambience
        this.el = null;
        this.startPad();
      });
    } else {
      this.startPad();
    }
    this.musicLevel = MUSIC.volume;
    const g = this.music.gain;
    const t = this.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(this.musicLevel, t + MUSIC.fadeInSeconds);
  }

  get started() {
    return this.begun;
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.ctx) {
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setValueAtTime(this.master.gain.value, t);
      this.master.gain.linearRampToValueAtTime(m ? 0 : 1, t + 0.6);
    }
    if (this.el && !this.elRouted) this.el.volume = m ? 0 : MUSIC.volume;
    this.emit();
  }

  /** Lower the music briefly under an important sound. */
  duck(level = MUSIC.duckLevel, holdMs = 1400) {
    if (!this.ctx || !this.begun) return;
    const g = this.music.gain;
    const t = this.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(this.musicLevel * level, t + 0.18);
    if (this.duckTimer) window.clearTimeout(this.duckTimer);
    this.duckTimer = window.setTimeout(() => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(this.musicLevel, now + 1.8);
    }, holdMs);
  }

  /** World Two: the music opens up and brightens. */
  setWorld(w: 1 | 2) {
    if (this.world === w) return;
    this.world = w;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.musicFilter.frequency.cancelScheduledValues(t);
    this.musicFilter.frequency.setValueAtTime(this.musicFilter.frequency.value, t);
    this.musicFilter.frequency.exponentialRampToValueAtTime(w === 2 ? 20000 : 7000, t + 4);
    this.padFilter.frequency.exponentialRampToValueAtTime(w === 2 ? 2100 : 1100, t + 4);
    if (w === 2) this.swell();
  }

  // ───────── generated ambient soundtrack ─────────
  private startPad() {
    if (!MUSIC.ambientFallback || this.padOn || !this.ctx) return;
    this.padOn = true;
    const step = () => {
      if (!this.ctx) return;
      const chords = this.world === 2 ? PAD_W2 : PAD_W1;
      const chord = chords[this.padIndex++ % chords.length];
      this.padChord(chord, 10);
      this.padTimer = window.setTimeout(step, 8000);
    };
    step();
    const twinkle = () => {
      if (!this.ctx) return;
      const f = midi(SCALE[Math.floor(Math.random() * SCALE.length)] + 12);
      this.tone(f, { type: 'sine', gain: 0.025, attack: 0.01, decay: 2.5, bus: 'pad' });
      this.twinkleTimer = window.setTimeout(twinkle, 2500 + Math.random() * 5000);
    };
    this.twinkleTimer = window.setTimeout(twinkle, 3000);
  }

  private padChord(notes: number[], dur: number) {
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    notes.forEach((m, i) => {
      const f = midi(m);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.05 - i * 0.006, t + 3);
      g.gain.setValueAtTime(0.05 - i * 0.006, t + dur - 3.5);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      g.connect(this.padFilter);
      const o1 = ctx.createOscillator();
      o1.type = 'triangle';
      o1.frequency.value = f;
      o1.detune.value = -4;
      const o2 = ctx.createOscillator();
      o2.type = 'sine';
      o2.frequency.value = f * 2;
      o2.detune.value = 5;
      const g2 = ctx.createGain();
      g2.gain.value = 0.35;
      o1.connect(g);
      o2.connect(g2).connect(g);
      o1.start(t);
      o2.start(t);
      o1.stop(t + dur + 0.1);
      o2.stop(t + dur + 0.1);
    });
  }

  // ───────── instruments ─────────
  private tone(
    f: number,
    o: { type?: OscillatorType; gain?: number; attack?: number; decay?: number; when?: number; bus?: 'sfx' | 'pad' },
  ) {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime + (o.when ?? 0);
    const osc = ctx.createOscillator();
    osc.type = o.type ?? 'sine';
    osc.frequency.value = f;
    const g = ctx.createGain();
    const peak = o.gain ?? 0.2;
    const dec = o.decay ?? 1.2;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + (o.attack ?? 0.008));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
    osc.connect(g).connect(o.bus === 'pad' ? this.padFilter : this.sfx);
    osc.start(t);
    osc.stop(t + dec + 0.05);
  }

  /** Soft vibraphone-like bell. */
  bell(f: number, vel = 1, when = 0) {
    if (!this.ctx) return;
    this.tone(f, { gain: 0.22 * vel, decay: 2.6, when });
    this.tone(f * 2.0, { gain: 0.06 * vel, decay: 1.1, when });
    this.tone(f * 3.99, { gain: 0.025 * vel, decay: 0.45, when });
    this.tone(f * 0.5, { type: 'triangle', gain: 0.04 * vel, decay: 1.6, when });
  }

  /** A breathy, saxophone-ish synth voice (original synthesis, no samples). */
  sax(f: number, dur = 0.5, when = 0, vel = 1) {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime + when;
    const end = t + dur;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.linearRampToValueAtTime(0.16 * vel, t + 0.06);
    out.gain.setValueAtTime(0.13 * vel, end - 0.05);
    out.gain.exponentialRampToValueAtTime(0.0001, end + 0.22);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.Q.value = 2.2;
    lp.frequency.setValueAtTime(500, t);
    lp.frequency.linearRampToValueAtTime(1600 + 900 * vel, t + 0.08);
    lp.frequency.linearRampToValueAtTime(1300, end);
    const peak = ctx.createBiquadFilter();
    peak.type = 'peaking';
    peak.frequency.value = 1150;
    peak.gain.value = 5;
    lp.connect(peak).connect(out).connect(this.sfx);

    const o1 = ctx.createOscillator();
    o1.type = 'sawtooth';
    o1.frequency.value = f;
    const o2 = ctx.createOscillator();
    o2.type = 'square';
    o2.frequency.value = f;
    o2.detune.value = 4;
    const g2 = ctx.createGain();
    g2.gain.value = 0.28;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 5.3;
    const depth = ctx.createGain();
    depth.gain.setValueAtTime(0, t);
    depth.gain.linearRampToValueAtTime(f * 0.007, t + Math.min(0.35, dur));
    lfo.connect(depth);
    depth.connect(o1.frequency);
    depth.connect(o2.frequency);
    o1.connect(lp);
    o2.connect(g2).connect(lp);

    if (this.noise) {
      const n = ctx.createBufferSource();
      n.buffer = this.noise;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 2600;
      bp.Q.value = 0.8;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.0001, t);
      ng.gain.linearRampToValueAtTime(0.035 * vel, t + 0.03);
      ng.gain.exponentialRampToValueAtTime(0.004, t + 0.25);
      ng.gain.exponentialRampToValueAtTime(0.0001, end + 0.1);
      n.connect(bp).connect(ng).connect(out);
      n.start(t);
      n.stop(end + 0.3);
    }
    [o1, o2, lfo].forEach((o) => {
      o.start(t);
      o.stop(end + 0.3);
    });
  }

  /** Tiny golden sparkle. */
  chime() {
    if (!this.ctx) return;
    [86, 91, 93, 98].forEach((m, i) => this.tone(midi(m), { gain: 0.06, decay: 1.4, when: i * 0.07 }));
  }

  /** Soft UI tick. */
  tick(pitch = 1) {
    if (!this.ctx) return;
    this.tone(1320 * pitch, { gain: 0.05, decay: 0.12 });
  }

  /** Airy noise sweep for flights and doors. */
  whoosh(dur = 1.2, up = true) {
    const ctx = this.ctx;
    if (!ctx || !this.noise) return;
    const t = ctx.currentTime;
    const n = ctx.createBufferSource();
    n.buffer = this.noise;
    n.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(up ? 280 : 2400, t);
    bp.frequency.exponentialRampToValueAtTime(up ? 2600 : 260, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.16, t + dur * 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(bp).connect(g).connect(this.sfx);
    n.start(t);
    n.stop(t + dur + 0.1);
  }

  /** Paper sound for books. */
  page() {
    const ctx = this.ctx;
    if (!ctx || !this.noise) return;
    const t = ctx.currentTime;
    const n = ctx.createBufferSource();
    n.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.09, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    n.connect(hp).connect(g).connect(this.sfx);
    n.start(t, Math.random());
    n.stop(t + 0.3);
  }

  /** Big shimmering chord: doorways and reveals. */
  swell() {
    if (!this.ctx) return;
    this.duck(0.5, 2600);
    [62, 69, 74, 76, 81, 86].forEach((m, i) => {
      this.tone(midi(m), { type: 'sine', gain: 0.05, attack: 1.2 + i * 0.15, decay: 5.5, when: i * 0.12 });
    });
  }

  /** Play a list of notes on a voice. */
  play(notes: { m: number; t: number; d: number; v?: number }[], voice: 'sax' | 'bell' = 'bell') {
    if (!this.ctx) return;
    const total = notes.reduce((a, n) => Math.max(a, n.t + n.d), 0);
    this.duck(MUSIC.duckLevel, total * 1000 + 600);
    notes.forEach((n) => {
      if (voice === 'sax') this.sax(midi(n.m), n.d, n.t, n.v ?? 0.9);
      else this.bell(midi(n.m), n.v ?? 0.9, n.t);
    });
  }
}

export const audio = new Engine();
