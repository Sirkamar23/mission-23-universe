import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { PERSONAL, PLANET } from '../config/content';
import { audio, midi, SCALE } from '../core/audio';
import { sky } from '../core/sky';
import { useStory } from '../core/story';
import { prefersReducedMotion, useAfter, capture } from '../core/util';
import { Btn, SceneShell, Sparkle } from '../components/ui';

const N = 23;
const RING = 148;

export default function Planet23() {
  const { go, update } = useStory();
  const [lit, setLit] = useState(0);
  const [complete, setComplete] = useState(false);
  const [letter, setLetter] = useState(false);
  const [fallback, setFallback] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const tracking = useRef<{ a: number; acc: number } | null>(null);
  const acc = useRef(0);
  const litRef = useRef(0);
  useAfter(12000, () => setFallback(true));

  useEffect(() => {
    sky.setTheme('gold');
  }, []);

  const setCount = (n: number) => {
    n = Math.min(N, n);
    if (n <= litRef.current) return;
    for (let k = litRef.current; k < n; k++) {
      const m = SCALE[k % 8] + 12 * Math.floor(k / 8);
      audio.bell(midi(m), 0.4, (k - litRef.current) * 0.05);
    }
    litRef.current = n;
    setLit(n);
    if (n === N) {
      audio.duck(0.4, 3000);
      window.setTimeout(() => {
        setComplete(true);
        audio.swell();
      }, 500);
      window.setTimeout(() => setLetter(true), 3600);
    }
  };

  const angleAt = (x: number, y: number) => {
    const r = svg.current!.getBoundingClientRect();
    return Math.atan2(y - (r.top + r.height / 2), x - (r.left + r.width / 2));
  };

  const lightAll = () => {
    let k = litRef.current;
    const step = () => {
      k++;
      setCount(k);
      if (k < N) window.setTimeout(step, 70);
    };
    step();
  };

  return (
    <SceneShell
      label="Planet 23"
      style={{ touchAction: 'none' }}
    >
      <header className="scene-header">
        <p className="eyebrow">Final destination</p>
        <h1 className="title">
          Planet <em>23</em>
        </h1>
        <p className="hint">{complete ? ' ' : `${PLANET.hint} · ${lit}/${N}`}</p>
      </header>

      <div
        style={{ flex: 1, width: '100%', display: 'grid', placeItems: 'center', minHeight: 0, zIndex: 2, touchAction: 'none' }}
        onPointerDown={(e) => {
          if (complete) return;
          audio.unlock();
          capture(e);
          tracking.current = { a: angleAt(e.clientX, e.clientY), acc: 0 };
        }}
        onPointerMove={(e) => {
          const t = tracking.current;
          if (!t || complete) return;
          const a = angleAt(e.clientX, e.clientY);
          let d = a - t.a;
          if (d > Math.PI) d -= Math.PI * 2;
          if (d < -Math.PI) d += Math.PI * 2;
          t.a = a;
          acc.current += Math.abs(d);
          setCount(Math.floor((acc.current / (Math.PI * 2)) * N * 1.2));
        }}
        onPointerUp={() => (tracking.current = null)}
        onPointerCancel={() => (tracking.current = null)}
      >
        <motion.svg
          ref={svg}
          viewBox="0 0 360 360"
          style={{ width: 'min(92vw, 440px)', maxHeight: '100%' }}
          animate={letter ? { scale: 0.7, y: -60, opacity: 0.6 } : { scale: 1, y: 0, opacity: 1 }}
          transition={{ duration: 1.8, ease: [0.22, 0.8, 0.2, 1] }}
          aria-label={`A luminous planet ringed by 23 stars, ${lit} lit`}
          role="img"
        >
          <defs>
            <radialGradient id="p23-body" cx="38%" cy="32%" r="75%">
              <stop offset="0" stopColor="#fff8ea" />
              <stop offset=".35" stopColor="#f0d4b4" />
              <stop offset=".7" stopColor="#c99bb4" />
              <stop offset="1" stopColor="#6a5394" />
            </radialGradient>
            <radialGradient id="p23-atm">
              <stop offset=".55" stopColor="#E9CFA0" stopOpacity="0" />
              <stop offset=".72" stopColor="#E9CFA0" stopOpacity={0.15 + (lit / N) * 0.35} />
              <stop offset="1" stopColor="#E9CFA0" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="p23-star">
              <stop offset="0" stopColor="#E9CFA0" stopOpacity=".85" />
              <stop offset="1" stopColor="#E9CFA0" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* hint arc */}
          {!complete && lit < 3 && !prefersReducedMotion() && (
            <motion.circle
              cx="180"
              cy="180"
              r={RING + 22}
              fill="none"
              stroke="#E9CFA0"
              strokeOpacity=".35"
              strokeDasharray="2 8"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '180px 180px' }}
            />
          )}
          <circle cx="180" cy="180" r="130" fill="url(#p23-atm)" />
          {/* back of ring */}
          <path d="M70 196 A112 30 -12 0 1 290 164" fill="none" stroke="#E9CFA0" strokeOpacity={0.3 + (lit / N) * 0.4} strokeWidth="3" />
          <circle cx="180" cy="180" r="74" fill="url(#p23-body)" />
          <path d="M120 160 Q180 150 240 168" stroke="#fff" strokeOpacity=".15" strokeWidth="6" fill="none" />
          <path d="M116 196 Q180 186 244 202" stroke="#6a5394" strokeOpacity=".18" strokeWidth="8" fill="none" />
          {/* front of ring */}
          <path d="M290 164 A112 30 -12 0 1 70 196" fill="none" stroke="#E9CFA0" strokeOpacity={0.5 + (lit / N) * 0.5} strokeWidth="3" />
          {complete && (
            <motion.text x="180" y="196" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="46" fill="#fffaf0" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} transition={{ duration: 2 }}>
              23
            </motion.text>
          )}
          {/* the ring of 23 */}
          {complete &&
            Array.from({ length: N }, (_, k) => {
              const a1 = (k / N) * Math.PI * 2 - Math.PI / 2;
              const a2 = ((k + 1) / N) * Math.PI * 2 - Math.PI / 2;
              return (
                <motion.line
                  key={'l' + k}
                  x1={180 + Math.cos(a1) * RING}
                  y1={180 + Math.sin(a1) * RING}
                  x2={180 + Math.cos(a2) * RING}
                  y2={180 + Math.sin(a2) * RING}
                  stroke="#E9CFA0"
                  strokeOpacity=".6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: k * 0.05, duration: 0.3 }}
                />
              );
            })}
          {Array.from({ length: N }, (_, k) => {
            const a = (k / N) * Math.PI * 2 - Math.PI / 2;
            const x = 180 + Math.cos(a) * RING;
            const y = 180 + Math.sin(a) * RING;
            const on = k < lit;
            return (
              <g key={k}>
                <motion.circle cx={x} cy={y} r="14" fill="url(#p23-star)" initial={false} animate={{ opacity: on ? 1 : 0.08, scale: on ? 1 : 0.6 }} style={{ transformOrigin: `${x}px ${y}px` }} />
                <Sparkle x={x} y={y} r={on ? 5.5 : 3} fill={on ? '#fffaf0' : '#8f86c4'} />
              </g>
            );
          })}
        </motion.svg>
      </div>

      <div className="bottom-dock">
        {!complete && fallback && lit < N && (
          <Btn variant="quiet" onClick={lightAll}>
            Light them all at once
          </Btn>
        )}
      </div>

      <AnimatePresence>
        {letter && (
          <Letter
            onFinish={() => {
              update({ finished: true });
              go('hoodie');
            }}
          />
        )}
      </AnimatePresence>
    </SceneShell>
  );
}

function Letter({ onFinish }: { onFinish: () => void }) {
  const reduce = prefersReducedMotion();
  const [shown, setShown] = useState(reduce ? PLANET.letter.length : 0);
  const box = useRef<HTMLDivElement>(null);
  const done = shown >= PLANET.letter.length;

  useEffect(() => {
    if (done) return;
    const text = PLANET.letter[shown] ?? '';
    const id = window.setTimeout(() => setShown((s) => s + 1), shown === 0 ? 1100 : 900 + text.length * 32);
    return () => window.clearTimeout(id);
  }, [shown, done]);

  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
  }, [shown, reduce]);

  return (
    <motion.div
      style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: 'calc(var(--safe-t) + var(--hud-h)) 14px calc(var(--safe-b) + 14px)', background: 'linear-gradient(rgba(11,16,38,0) 0%, rgba(11,16,38,.55) 40%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => !done && setShown(PLANET.letter.length)}
    >
      <motion.article
        ref={box}
        aria-label="Birthday letter"
        initial={{ y: 80, opacity: 0, rotate: -1.5 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 1.4, ease: [0.22, 0.8, 0.2, 1] }}
        style={{
          width: 'min(100%, 460px)',
          maxHeight: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          userSelect: 'text',
          WebkitUserSelect: 'text',
          background: 'radial-gradient(120% 80% at 30% 0%, #fffaf0, #f4ead8 60%, #ecdfc6)',
          color: '#2b2445',
          borderRadius: 6,
          padding: '30px 26px 26px',
          boxShadow: '0 30px 70px -20px rgba(0,0,0,.8), inset 0 0 0 1px rgba(201,166,107,.35), inset 0 0 40px rgba(201,166,107,.18)',
          position: 'relative',
        }}
      >
        <svg width="100%" height="14" viewBox="0 0 300 14" preserveAspectRatio="xMidYMid meet" aria-hidden style={{ display: 'block', marginBottom: 14 }}>
          <path d="M40 7 H130 M170 7 H260" stroke="#c9a66b" strokeWidth=".8" />
          <path d="M150 1 L153 7 L150 13 L147 7Z" fill="#c9a66b" />
        </svg>
        {PLANET.letter.map((p, i) =>
          i < shown ? (
            <motion.p
              key={i}
              initial={reduce ? false : { opacity: 0, clipPath: 'inset(0 100% 0 0)', filter: 'blur(3px)' }}
              animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)', filter: 'blur(0px)' }}
              transition={{ duration: Math.min(2.6, 0.8 + p.length * 0.018), ease: 'easeOut' }}
              style={{
                fontFamily: 'var(--serif)',
                fontStyle: i === 0 || i === PLANET.letter.length - 1 ? 'italic' : 'normal',
                fontSize: i === 0 ? 30 : 'clamp(17.5px, 4.7vw, 20px)',
                lineHeight: 1.42,
                margin: i === 0 ? '0 0 14px' : '0 0 12px',
                color: i === PLANET.letter.length - 1 ? '#8a5a3c' : '#2b2445',
              }}
            >
              {p}
            </motion.p>
          ) : null,
        )}
        {done && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1.4 }} style={{ fontFamily: 'var(--hand)', fontSize: 30, margin: '6px 0 0', textAlign: 'right', color: '#5a3f6e' }}>
            — {PERSONAL.signature}
          </motion.p>
        )}
        {!done && <p style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '.2em', color: '#9a8f80', textTransform: 'uppercase', margin: '10px 0 0' }}>tap to reveal it all</p>}
      </motion.article>
      {done && (
        <div style={{ marginTop: 14 }}>
          <Btn variant="gold" onClick={onFinish} delay={1.6}>
            One last discovery remains <span className="arrow">→</span>
          </Btn>
        </div>
      )}
    </motion.div>
  );
}
