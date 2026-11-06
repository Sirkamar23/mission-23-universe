import { useEffect, useRef } from 'react';
import { sky, useSky, type SkyTheme } from '../core/sky';
import { prefersReducedMotion } from '../core/util';

const BACKDROPS: Record<SkyTheme, string> = {
  void: 'radial-gradient(80% 60% at 50% 50%, #0c1029 0%, #05070f 70%)',
  w1: 'radial-gradient(120% 70% at 50% 8%, #2a2c66 0%, #171B3F 38%, #0B1026 78%), linear-gradient(#0B1026,#0B1026)',
  w2: 'radial-gradient(110% 55% at 50% 108%, #8a6f9c 0%, #4a3f78 26%, #262457 52%, #12163a 80%), linear-gradient(#12163a,#12163a)',
  gold: 'radial-gradient(90% 60% at 50% 62%, #5a4a5a 0%, #2b2650 34%, #141838 64%, #0B1026 90%)',
};

/** Painted atmosphere behind everything; cross-fades between worlds. */
export function Backdrop() {
  const { theme } = useSky();
  return (
    <div className="backdrop" aria-hidden>
      {(Object.keys(BACKDROPS) as SkyTheme[]).map((k) => (
        <div key={k} style={{ background: BACKDROPS[k], opacity: k === theme ? 1 : 0 }} />
      ))}
      {/* faint milky-way band */}
      <div
        style={{
          opacity: theme === 'void' ? 0 : 0.55,
          background:
            'linear-gradient(115deg, transparent 30%, rgba(167,154,205,0.10) 44%, rgba(216,169,182,0.08) 50%, rgba(167,154,205,0.06) 56%, transparent 70%)',
        }}
      />
    </div>
  );
}

type Star = { x: number; y: number; z: number; r: number; tw: number; sp: number; c: number };

const PALETTES: Record<SkyTheme, string[]> = {
  void: ['247,240,228', '233,207,160', '167,154,205'],
  w1: ['247,240,228', '233,207,160', '167,154,205', '200,205,255'],
  w2: ['247,240,228', '233,207,160', '216,169,182', '167,154,205'],
  gold: ['247,240,228', '233,207,160', '233,207,160', '216,169,182'],
};

/** Canvas starfield: twinkles, drifts, parallaxes with the finger, and warps on command. */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const g = c.getContext('2d');
    if (!g) return;
    const reduce = prefersReducedMotion();
    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let raf = 0;
    let last = performance.now();
    let warp = 0;
    let px = 0;
    let py = 0;
    let tpx = 0;
    let tpy = 0;
    let bright = 0.25;

    const mk = (spread = 1): Star => ({
      x: (Math.random() - 0.5) * w * spread,
      y: (Math.random() - 0.5) * h * spread,
      z: 0.15 + Math.random() * 0.85,
      r: Math.random() < 0.06 ? 1.3 + Math.random() * 0.9 : 0.35 + Math.random() * 0.8,
      tw: Math.random() * Math.PI * 2,
      sp: 0.4 + Math.random() * 1.8,
      c: Math.floor(Math.random() * 4),
    });

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      c.style.width = w + 'px';
      c.style.height = h + 'px';
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(340, Math.max(140, (w * h) / 1700)));
      stars = Array.from({ length: n }, () => mk());
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: PointerEvent) => {
      tpx = e.clientX / w - 0.5;
      tpy = e.clientY / h - 0.5;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onMove, { passive: true });

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const st = sky.get();
      const pal = PALETTES[st.theme];
      bright += ((st.theme === 'void' ? 0.28 : 1) - bright) * Math.min(1, dt * 0.6);
      warp += ((reduce ? st.warp * 0.25 : st.warp) - warp) * Math.min(1, dt * 2.2);
      px += (tpx - px) * Math.min(1, dt * 1.5);
      py += (tpy - py) * Math.min(1, dt * 1.5);
      g.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const t = now / 1000;
      const streak = Math.abs(warp) > 0.12;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const ox = s.x;
        const oy = s.y;
        if (!reduce) {
          s.y -= 3 * s.z * dt;
          s.x -= 1.2 * s.z * dt;
        }
        if (warp !== 0) {
          const f = warp * dt * (0.4 + s.z * 1.6) * 1.4;
          s.x += s.x * f;
          s.y += s.y * f;
          if (warp < 0 && Math.abs(s.x) < 2 && Math.abs(s.y) < 2) {
            const n = mk(1.2);
            s.x = n.x;
            s.y = n.y;
          }
        }
        if (s.x < -w * 0.62 || s.x > w * 0.62 || s.y < -h * 0.62 || s.y > h * 0.62) {
          if (warp > 0.05) {
            s.x = (Math.random() - 0.5) * w * 0.2;
            s.y = (Math.random() - 0.5) * h * 0.2;
          } else {
            const n = mk();
            s.x = n.x;
            s.y = n.y;
            if (!reduce && warp >= 0) {
              // re-enter from the bottom-right edge as the sky drifts
              if (Math.random() < 0.5) s.y = h * 0.6;
              else s.x = w * 0.6;
            }
          }
          continue;
        }
        const x = cx + s.x - px * 26 * s.z;
        const y = cy + s.y - py * 26 * s.z;
        const a = (0.45 + 0.55 * Math.sin(t * s.sp + s.tw)) * (0.35 + s.z * 0.65) * bright;
        const col = pal[s.c % pal.length];
        if (streak) {
          g.strokeStyle = `rgba(${col},${Math.min(1, a + 0.2)})`;
          g.lineWidth = s.r * 0.9;
          g.beginPath();
          g.moveTo(x, y);
          g.lineTo(cx + ox - px * 26 * s.z - (s.x - ox) * 3, cy + oy - py * 26 * s.z - (s.y - oy) * 3);
          g.stroke();
        } else if (s.r > 1.2) {
          g.fillStyle = `rgba(${col},${a * 0.16})`;
          g.beginPath();
          g.arc(x, y, s.r * 4, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = `rgba(${col},${a})`;
          g.beginPath();
          g.arc(x, y, s.r, 0, Math.PI * 2);
          g.fill();
        } else {
          g.fillStyle = `rgba(${col},${a})`;
          g.fillRect(x - s.r, y - s.r, s.r * 2, s.r * 2);
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onVis = () => {
      if (document.visibilityState === 'hidden') cancelAnimationFrame(raf);
      else {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onMove);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);
  return <canvas ref={ref} className="sky-canvas" aria-hidden />;
}

type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; c: string };

/** Little stars that follow the finger. Sleeps when nothing is moving. */
export function FingerTrail() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const g = c.getContext('2d');
    if (!g) return;
    const reduce = prefersReducedMotion();
    let w = 0;
    let h = 0;
    const ps: P[] = [];
    let raf = 0;
    let running = false;
    let last = 0;
    let lx = -1;
    let ly = -1;
    let down = false;
    const cols = ['233,207,160', '247,240,228', '216,169,182', '167,154,205'];

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      c.style.width = w + 'px';
      c.style.height = h + 'px';
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const spawn = (x: number, y: number, n: number) => {
      for (let i = 0; i < n; i++) {
        if (ps.length > 140) ps.shift();
        const max = 0.7 + Math.random() * 0.8;
        ps.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 24,
          vy: -6 - Math.random() * 26,
          life: max,
          max,
          r: 0.8 + Math.random() * 2.2,
          c: cols[(Math.random() * cols.length) | 0],
        });
      }
      if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const star = (x: number, y: number, r: number) => {
      g.beginPath();
      g.moveTo(x, y - r * 2.4);
      g.quadraticCurveTo(x, y, x + r * 2.4, y);
      g.quadraticCurveTo(x, y, x, y + r * 2.4);
      g.quadraticCurveTo(x, y, x - r * 2.4, y);
      g.quadraticCurveTo(x, y, x, y - r * 2.4);
      g.fill();
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      g.clearRect(0, 0, w, h);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life -= dt;
        if (p.life <= 0) {
          ps.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.98;
        const k = p.life / p.max;
        g.fillStyle = `rgba(${p.c},${k * 0.9})`;
        if (p.r > 2) star(p.x, p.y, p.r * 0.7 * k + 0.3);
        else {
          g.beginPath();
          g.arc(p.x, p.y, p.r * k, 0, Math.PI * 2);
          g.fill();
        }
      }
      if (ps.length) raf = requestAnimationFrame(frame);
      else {
        running = false;
        g.clearRect(0, 0, w, h);
      }
    };

    const onDown = (e: PointerEvent) => {
      down = true;
      lx = e.clientX;
      ly = e.clientY;
      spawn(e.clientX, e.clientY, reduce ? 2 : 7);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && !down && Math.random() > 0.35) return;
      const d = Math.hypot(e.clientX - lx, e.clientY - ly);
      if (d < 7) return;
      lx = e.clientX;
      ly = e.clientY;
      spawn(e.clientX, e.clientY, reduce ? 1 : Math.min(3, 1 + Math.floor(d / 14)));
    };
    const onUp = () => {
      down = false;
    };
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onUp, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, []);
  return <canvas ref={ref} className="trail-canvas" aria-hidden />;
}
