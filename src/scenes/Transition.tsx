import { motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TRANSITION } from '../config/content';
import { audio } from '../core/audio';
import { sky } from '../core/sky';
import { useStory, WORLD_ONE_STOPS } from '../core/story';
import { clamp, easeInOut, lerp, rng, span, useClock, capture } from '../core/util';
import { Btn, SceneShell, Sparkle } from '../components/ui';
import { STOP_POS } from './WorldOne';

const C: [number, number] = [195, 380];
const K = 0.42; // how far the camera pulls back
const FINAL = 0.74; // door framing

/** The arch, defined in “pulled-back” coordinates. Four of its stars are the four destinations. */
const ARCH_PB: ([number, number] | string)[] = [
  [159, 492],
  'flavor',
  'jazz',
  [166, 292],
  [178, 270],
  [195, 255],
  [212, 270],
  [224, 292],
  [231, 330],
  'library',
  'victories',
  [231, 492],
];

const unscale = ([x, y]: [number, number]): [number, number] => [C[0] + (x - C[0]) / K, C[1] + (y - C[1]) / K];
const ARCH: [number, number][] = ARCH_PB.map((p) => (typeof p === 'string' ? STOP_POS[p as keyof typeof STOP_POS] : unscale(p)));

export default function Transition() {
  const { go, update } = useStory();
  const [entering, setEntering] = useState(false);
  const [open, setOpen] = useState(0);
  const enterT = useRef<number | null>(null);
  const t = useClock(true);
  const drag = useRef<number | null>(null);

  const field = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: 70 }, () => [lerp(-300, 690, r()), lerp(-620, 1380, r()), 0.4 + r() * 0.8] as [number, number, number]);
  }, []);

  // little neighbouring constellations in the wider sky
  const links = useMemo(() => {
    const out: [number, number][] = [];
    for (let i = 0; i < 24; i += 2) {
      let best = -1;
      let bd = Infinity;
      field.forEach((q, j) => {
        if (j === i) return;
        const d = Math.hypot(q[0] - field[i][0], q[1] - field[i][1]);
        if (d < bd) {
          bd = d;
          best = j;
        }
      });
      if (bd < 260) out.push([i, best]);
    }
    return out;
  }, [field]);

  useEffect(() => {
    sky.setTheme('w1');
    const a = window.setTimeout(() => sky.warp(-0.45), 1200);
    const b = window.setTimeout(() => sky.warp(0), 4400);
    const c = window.setTimeout(() => audio.swell(), 4300);
    return () => {
      [a, b, c].forEach((i) => window.clearTimeout(i));
      sky.warp(0);
    };
  }, []);

  // camera
  let S = lerp(1, K, easeInOut(span(t, 1.2, 4.4)));
  S = lerp(S, FINAL, easeInOut(span(t, 5.8, 8.0)));
  if (entering && enterT.current !== null) {
    const e = easeInOut(span(t, enterT.current, enterT.current + 1.7));
    S = lerp(FINAL, 9, e * e);
  }
  const P = ([x, y]: [number, number]): [number, number] => [C[0] + (x - C[0]) * S, C[1] + (y - C[1]) * S];

  const archIn = span(t, 3.0, 4.6);
  const lines = span(t, 4.4, 6.2);
  const doorGlow = span(t, 5.6, 8.0);
  const interactive = t > 9.6;
  const pts = ARCH.map(P);
  const doorPath = 'M' + pts.map((p) => p.join(' ')).join(' L') + ' Z';
  const totalSegs = pts.length - 1;
  const flash = entering && enterT.current !== null ? span(t, enterT.current + 0.9, enterT.current + 1.8) : 0;

  const enter = () => {
    if (entering) return;
    audio.unlock();
    setOpen(1);
    setEntering(true);
    enterT.current = t;
    audio.whoosh(2.2);
    audio.setWorld(2);
    sky.warp(1.6);
    window.setTimeout(() => {
      sky.setTheme('w2');
      sky.warp(0);
      update({ transitionDone: true });
      go('world2');
    }, 2100);
  };

  const pillarL = pts[0][0];
  const pillarR = pts[pts.length - 1][0];
  const top = pts[5][1];
  const bottom = pts[0][1];

  return (
    <SceneShell label="A celestial doorway" style={{ padding: 0 }}>
      <svg
        className="scene-fill"
        viewBox="0 0 390 760"
        preserveAspectRatio="xMidYMid meet"
        style={{ touchAction: 'none' }}
        onPointerDown={(e) => {
          if (!interactive) return;
          capture(e);
          drag.current = e.clientY;
          audio.unlock();
        }}
        onPointerMove={(e) => {
          if (drag.current === null || entering) return;
          const d = clamp((drag.current - e.clientY) / 220);
          setOpen(d);
          if (d >= 0.85) {
            drag.current = null;
            enter();
          }
        }}
        onPointerUp={() => {
          if (drag.current === null) return;
          drag.current = null;
          if (open > 0.5) enter();
          else setOpen(0);
        }}
      >
        <defs>
          <linearGradient id="tr-door" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff6e0" stopOpacity={0.15 + open * 0.6} />
            <stop offset=".55" stopColor="#E9CFA0" stopOpacity={0.12 + open * 0.5} />
            <stop offset="1" stopColor="#D8A9B6" stopOpacity={0.2 + open * 0.5} />
          </linearGradient>
          <radialGradient id="tr-glow">
            <stop offset="0" stopColor="#fff2d6" stopOpacity=".9" />
            <stop offset=".4" stopColor="#E9CFA0" stopOpacity=".3" />
            <stop offset="1" stopColor="#E9CFA0" stopOpacity="0" />
          </radialGradient>
          <clipPath id="tr-clip">
            <path d={doorPath} />
          </clipPath>
        </defs>

        {/* the wider sky revealed by pulling back */}
        <g opacity={archIn * (1 - flash)}>
          {field.map(([x, y, r], i) => {
            const [sx, sy] = P([x, y]);
            return <circle key={i} cx={sx} cy={sy} r={r * Math.max(0.6, S)} fill="#F7F0E4" opacity={0.3 + (i % 5) * 0.12} />;
          })}
          {links.map(([i, j]) => {
            const a = P([field[i][0], field[i][1]]);
            const b = P([field[j][0], field[j][1]]);
            return <line key={i + '-' + j} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#A79ACD" strokeOpacity=".28" />;
          })}
        </g>

        {/* the old route, fading as the arch takes over */}
        <g opacity={(1 - lines) * 0.7}>
          {(['victories', 'flavor', 'library', 'jazz'] as const).slice(0, -1).map((s, i, arr) => {
            const a = P(STOP_POS[s]);
            const b = P(STOP_POS[(['victories', 'flavor', 'library', 'jazz'] as const)[i + 1]]);
            return <line key={s} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#E9CFA0" strokeOpacity=".5" strokeDasharray="1 6" data-n={arr.length} />;
          })}
        </g>

        {/* doorway light */}
        <g opacity={doorGlow}>
          <path d={doorPath} fill="url(#tr-door)" />
          <g clipPath="url(#tr-clip)">
            {/* door leaves swing apart */}
            <rect x={pillarL} y={top} width={((pillarR - pillarL) / 2) * (1 - open)} height={bottom - top} fill="#0f1334" opacity={0.75 * (1 - open)} />
            <rect
              x={pillarR - ((pillarR - pillarL) / 2) * (1 - open)}
              y={top}
              width={((pillarR - pillarL) / 2) * (1 - open)}
              height={bottom - top}
              fill="#0f1334"
              opacity={0.75 * (1 - open)}
            />
            <line x1={(pillarL + pillarR) / 2} y1={top} x2={(pillarL + pillarR) / 2} y2={bottom} stroke="#E9CFA0" strokeOpacity={0.6 * (1 - open)} />
            {Array.from({ length: 9 }, (_, i) => (
              <line
                key={i}
                x1={(pillarL + pillarR) / 2}
                y1={bottom}
                x2={pillarL + ((pillarR - pillarL) * i) / 8}
                y2={top}
                stroke="#fff6e0"
                strokeOpacity={open * 0.35}
                strokeWidth={S * 3}
              />
            ))}
          </g>
          <ellipse cx={(pillarL + pillarR) / 2} cy={(top + bottom) / 2} rx={(pillarR - pillarL) * (0.6 + open)} ry={(bottom - top) * 0.6} fill="url(#tr-glow)" opacity={0.25 + open * 0.6} />
        </g>

        {/* arch lines */}
        {pts.slice(0, -1).map((a, i) => {
          const b = pts[i + 1];
          const local = clamp(lines * totalSegs - i);
          return (
            <line
              key={i}
              x1={a[0]}
              y1={a[1]}
              x2={lerp(a[0], b[0], local)}
              y2={lerp(a[1], b[1], local)}
              stroke="#E9CFA0"
              strokeWidth={Math.max(1, 1.6 * S)}
              strokeLinecap="round"
              opacity={local > 0 ? 0.9 : 0}
            />
          );
        })}

        {/* arch stars (the four destinations are among them) */}
        {pts.map(([x, y], i) => {
          const name = ARCH_PB[i];
          const isStop = typeof name === 'string';
          const o = isStop ? 1 : archIn;
          const jitter = isStop && t < 1.4 ? Math.sin(t * 22 + i) * 1.2 * span(t, 0.2, 1.2) : 0;
          return (
            <g key={i} opacity={o}>
              <circle cx={x + jitter} cy={y} r={(isStop ? 26 : 16) * Math.max(0.55, S)} fill="url(#tr-glow)" opacity={isStop ? 0.85 : 0.5} />
              <Sparkle x={x + jitter} y={y} r={(isStop ? 9 : 6) * Math.max(0.6, S)} fill="#F7F0E4" />
            </g>
          );
        })}
        {t < 2.6 &&
          WORLD_ONE_STOPS.map((s) => {
            const [x, y] = P(STOP_POS[s]);
            return (
              <circle key={s} cx={x} cy={y} r={54 * S} fill="none" stroke="#E9CFA0" strokeOpacity={0.5 * (1 - span(t, 1.2, 2.6))} strokeDasharray="2 4" />
            );
          })}
      </svg>

      <div className="caption" style={{ position: 'absolute', left: 20, right: 20, margin: '0 auto', bottom: 'calc(var(--safe-b) + 118px)', gap: 8 }}>
        {t > 6.4 && !entering && (
          <>
            <motion.p className="lede glow-text" style={{ fontSize: 'clamp(20px,5.6vw,26px)' }} initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 1.6 }}>
              {TRANSITION.lines[0]}
            </motion.p>
            {t > 8.4 && (
              <motion.p className="lede italic gold glow-text" style={{ fontSize: 'clamp(20px,5.6vw,26px)' }} initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 1.6 }}>
                {TRANSITION.lines[1]}
              </motion.p>
            )}
          </>
        )}
      </div>

      {interactive && !entering && (
        <div className="bottom-dock" style={{ bottom: 'calc(var(--safe-b) + 16px)' }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <motion.svg width="22" height="26" viewBox="0 0 22 26" animate={{ y: [4, -4, 4] }} transition={{ duration: 2, repeat: Infinity }} aria-hidden>
              <path d="M11 24 V3 M4 10 L11 3 L18 10" stroke="#E9CFA0" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            </motion.svg>
            <p className="eyebrow" style={{ margin: 0 }}>
              {TRANSITION.hint}
            </p>
            <Btn variant="quiet" onClick={enter} style={{ minHeight: 34, fontSize: 12 }} label="Open the doorway">
              or tap to open
            </Btn>
          </motion.div>
        </div>
      )}

      {/* light floods in */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(60% 50% at 50% 48%, #fffaf0, #f3dcc0 50%, #c9a9c9)',
          opacity: flash,
        }}
      />
    </SceneShell>
  );
}
