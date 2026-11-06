import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { OPENING } from '../config/content';
import { audio, midi, SCALE } from '../core/audio';
import { sky } from '../core/sky';
import { useStory } from '../core/story';
import { clamp, easeInOut, lerp, rng, capture } from '../core/util';
import { Btn, RocketArt, SceneShell, Sparkle, Typewriter } from '../components/ui';

/** The constellation that becomes “23” (viewBox 0 0 200 124). */
const TWO: [number, number][] = [
  [22, 38], [36, 20], [60, 14], [80, 24], [82, 44], [64, 64], [40, 84], [20, 104], [84, 104],
];
const THREE: [number, number][] = [
  [112, 24], [134, 14], [158, 18], [170, 34], [158, 52], [138, 58], [160, 64], [174, 82], [162, 102], [138, 110], [112, 100],
];
const PTS = [...TWO, ...THREE];
const SEGS: [number, number][] = [
  ...TWO.slice(1).map((_, i) => [i, i + 1] as [number, number]),
  ...THREE.slice(1).map((_, i) => [TWO.length + i, TWO.length + i + 1] as [number, number]),
];

type Phase = 'seed' | 'formed' | 'brief' | 'launching';

export default function Opening() {
  const { progress, resumeScene, go, restart } = useStory();
  const [phase, setPhase] = useState<Phase>('seed');
  const [p, setP] = useState(0);
  const [returning, setReturning] = useState(progress.started);
  const [ready, setReady] = useState(false);
  const [tapped, setTapped] = useState(false);
  const holding = useRef(false);
  const lastCount = useRef(0);

  const scatter = useMemo(() => {
    const r = rng(23);
    return PTS.map(() => [lerp(-90, 290, r()), lerp(-170, 290, r())] as [number, number]);
  }, []);

  useEffect(() => {
    sky.setTheme('void');
  }, []);

  // hold-to-awaken loop
  useEffect(() => {
    if (phase !== 'seed') return;
    let raf = 0;
    let last = performance.now();
    let cur = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      cur = clamp(cur + dt * (holding.current ? 1 / 2.6 : -1 / 1.4));
      setP(cur);
      const count = Math.floor(cur * PTS.length * 1.05);
      if (count > lastCount.current && holding.current) {
        audio.bell(midi(SCALE[(count - 1) % SCALE.length] + 12 * Math.floor((count - 1) / SCALE.length)), 0.32);
      }
      lastCount.current = count;
      if (cur >= 1) {
        holding.current = false;
        setPhase('formed');
        audio.beginMusic();
        audio.swell();
        sky.setTheme('w1');
        window.setTimeout(() => setPhase('brief'), 3400);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const startHold = () => {
    audio.unlock();
    holding.current = true;
    setTapped(true);
  };
  const endHold = () => {
    holding.current = false;
  };

  const launch = () => {
    if (phase === 'launching') return;
    audio.unlock();
    audio.beginMusic();
    setPhase('launching');
    audio.whoosh(1.8);
    sky.setTheme('w1');
    sky.warp(1.6);
    window.setTimeout(() => sky.warp(0), 1500);
    window.setTimeout(() => go(returning ? resumeScene : 'world1'), 1350);
  };

  const formed = phase !== 'seed';
  const post = phase === 'brief' || phase === 'launching';

  return (
    <SceneShell label="Opening" style={{ padding: 0 }}>
      {/* constellation */}
      <motion.div
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 'min(80vw, 340px)',
          x: '-50%',
          y: '-50%',
        }}
        animate={formed ? { y: 'calc(-50% - 27vh)', scale: 0.74 } : { y: '-50%', scale: 1 }}
        transition={{ duration: 2.2, ease: [0.65, 0, 0.25, 1], delay: formed ? 1.1 : 0 }}
      >
        <svg viewBox="0 0 200 124" width="100%">
          <defs>
            <radialGradient id="op-glow">
              <stop offset="0" stopColor="#E9CFA0" stopOpacity=".85" />
              <stop offset="1" stopColor="#E9CFA0" stopOpacity="0" />
            </radialGradient>
          </defs>
          {SEGS.map(([a, b], i) => {
            const qa = clamp((p - (a / PTS.length) * 0.8) / 0.2);
            const qb = clamp((p - (b / PTS.length) * 0.8) / 0.2);
            const on = formed ? 1 : Math.min(qa, qb);
            const A = PTS[a];
            const B = PTS[b];
            return (
              <motion.line
                key={i}
                x1={A[0]}
                y1={A[1]}
                x2={lerp(A[0], B[0], formed ? 1 : on)}
                y2={lerp(A[1], B[1], formed ? 1 : on)}
                stroke="#E9CFA0"
                strokeWidth={formed ? 0.9 : 0.6}
                strokeLinecap="round"
                opacity={on * (formed ? 0.9 : 0.55)}
                animate={formed ? { opacity: [0.9, 1, 0.75] } : undefined}
                transition={{ duration: 2, delay: i * 0.04 }}
              />
            );
          })}
          {PTS.map(([x, y], i) => {
            const q = formed ? 1 : clamp((p - (i / PTS.length) * 0.8) / 0.2);
            const e = easeInOut(q);
            const sx = lerp(scatter[i][0], x, e);
            const sy = lerp(scatter[i][1], y, e);
            return (
              <g key={i} opacity={q}>
                <circle cx={sx} cy={sy} r={formed ? 7 : 5} fill="url(#op-glow)" />
                <Sparkle x={sx} y={sy} r={formed ? 3.4 : 2.6} fill="#F7F0E4" />
              </g>
            );
          })}
        </svg>
      </motion.div>

      {/* the first star */}
      <AnimatePresence>
        {phase === 'seed' && (
          <motion.div
            key="seed"
            style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
          >
            <button
              aria-label="Touch and hold the star to begin"
              onPointerDown={(e) => {
                capture(e);
                startHold();
              }}
              onPointerUp={endHold}
              onPointerCancel={endHold}
              onPointerLeave={endHold}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  startHold();
                }
              }}
              onKeyUp={endHold}
              onContextMenu={(e) => e.preventDefault()}
              style={{ width: 150, height: 150, borderRadius: '50%', display: 'grid', placeItems: 'center', touchAction: 'none' }}
            >
              <svg width="150" height="150" viewBox="-75 -75 150 150" aria-hidden>
                <circle r={30 + p * 40} fill="url(#seed-glow)" opacity={0.6 + p * 0.4} />
                <defs>
                  <radialGradient id="seed-glow">
                    <stop offset="0" stopColor="#E9CFA0" stopOpacity=".7" />
                    <stop offset="1" stopColor="#E9CFA0" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle
                  r="34"
                  fill="none"
                  stroke="#E9CFA0"
                  strokeOpacity={p > 0 ? 0.55 : 0}
                  strokeWidth="1"
                  strokeDasharray={`${p * 213.6} 300`}
                  transform="rotate(-90)"
                />
                <g className="pulse" style={{ transformOrigin: 'center', transformBox: 'fill-box' }}>
                  <Sparkle r={9 + p * 5} fill="#F7F0E4" />
                </g>
                <circle r="2.2" fill="#fff" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'seed' && (
          <motion.div
            key="inv"
            className="caption"
            style={{ position: 'absolute', top: 'calc(50% + 96px)', left: 24, right: 24, margin: '0 auto' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: p > 0.15 ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, delay: p > 0 ? 0 : 0.8 }}
          >
            <p className="lede italic">{OPENING.invitation}</p>
            <p className="eyebrow" style={{ marginTop: 10, opacity: 0.8 }}>
              {tapped && p < 0.05 ? 'keep holding…' : OPENING.holdHint}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* title */}
      {formed && (
        <div style={{ position: 'absolute', top: '36%', left: 0, right: 0, textAlign: 'center', padding: '0 20px' }}>
          <h1
            style={{
              fontFamily: 'var(--serif)',
              fontWeight: 500,
              fontSize: 'clamp(40px, 12vw, 62px)',
              letterSpacing: '0.16em',
              margin: 0,
              paddingLeft: '0.16em',
              lineHeight: 1,
            }}
          >
            {OPENING.title.split('').map((c, i) => (
              <motion.span
                key={i}
                style={{ display: 'inline-block', color: i >= 8 ? 'var(--gold)' : 'var(--ivory)' }}
                initial={{ opacity: 0, y: 14, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 1.6 + i * 0.09, duration: 1.2 }}
              >
                {c === ' ' ? ' ' : c}
              </motion.span>
            ))}
          </h1>
          <motion.p
            className="lede italic"
            style={{ color: 'var(--rose)', marginTop: 10, fontSize: 'clamp(19px,5.4vw,24px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.8, duration: 1.6 }}
          >
            {OPENING.subtitle}
          </motion.p>
        </div>
      )}

      {/* briefing */}
      {post && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: phase === 'launching' ? 0 : 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="mc-panel"
          style={{ position: 'absolute', top: '51%', left: 0, right: 0, margin: '0 auto', width: 'min(340px, calc(100vw - 40px))', minHeight: 118 }}
        >
          <div className="mc-label">Mission Control</div>
          <Typewriter
            lines={returning ? OPENING.returning : OPENING.briefing}
            speed={34}
            pause={480}
            startDelay={300}
            onDone={() => setReady(true)}
          />
        </motion.div>
      )}

      {post && ready && (
        <div className="bottom-dock" style={{ bottom: 'calc(var(--safe-b) + 18px)' }}>
          {!returning && (
            <motion.p
              className="lede italic gold"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === 'launching' ? 0 : 1 }}
              transition={{ duration: 1.2 }}
              style={{ fontSize: 22 }}
            >
              {OPENING.waiting}
            </motion.p>
          )}
          <LaunchRocket onLaunch={launch} launching={phase === 'launching'} />
          {!returning ? (
            <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: phase === 'launching' ? 0 : 0.8 }} transition={{ delay: 0.8 }}>
              {OPENING.launchHint}
            </motion.p>
          ) : (
            phase !== 'launching' && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Btn variant="gold" onClick={launch}>
                  Resume mission
                </Btn>
                <Btn
                  variant="quiet"
                  onClick={() => {
                    restart();
                    setReturning(false);
                  }}
                >
                  Begin again
                </Btn>
              </div>
            )
          )}
        </div>
      )}
    </SceneShell>
  );
}

function LaunchRocket({ onLaunch, launching }: { onLaunch: () => void; launching: boolean }) {
  const [dy, setDy] = useState(0);
  const start = useRef<number | null>(null);
  const moved = useRef(false);
  return (
    <motion.button
      type="button"
      aria-label="Launch the rocket"
      style={{ width: 96, height: 110, touchAction: 'none', display: 'grid', placeItems: 'center' }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={launching ? { opacity: 1, y: -window.innerHeight, scale: 0.7 } : { opacity: 1, scale: 1, y: dy }}
      transition={launching ? { duration: 1.4, ease: [0.5, 0, 0.9, 0.6] } : { type: 'spring', stiffness: 300, damping: 24 }}
      onPointerDown={(e) => {
        capture(e);
        start.current = e.clientY;
        moved.current = false;
        audio.unlock();
      }}
      onPointerMove={(e) => {
        if (start.current === null || launching) return;
        const d = Math.min(0, e.clientY - start.current);
        if (d < -6) moved.current = true;
        setDy(d * 0.8);
        if (d < -70) {
          start.current = null;
          onLaunch();
        }
      }}
      onPointerUp={() => {
        if (start.current !== null && !moved.current) onLaunch();
        start.current = null;
        if (!launching) setDy(0);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onLaunch();
        }
      }}
    >
      <svg width="70" height="104" viewBox="-30 -36 60 90" aria-hidden className={launching ? '' : 'float'}>
        <ellipse cx="0" cy="40" rx="20" ry="4" fill="#E9CFA0" opacity={launching ? 0 : 0.18} />
        <g transform="scale(1.35)">
          <RocketArt flame={launching ? 1.8 : 0.35 + Math.min(1, -dy / 60)} id="op-rk" />
        </g>
      </svg>
    </motion.button>
  );
}
