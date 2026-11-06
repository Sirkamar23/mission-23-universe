import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { WORKSHOP } from '../config/content';
import { audio, midi } from '../core/audio';
import { missionControl } from '../core/missionControl';
import { useStory } from '../core/story';
import { Btn, Reveal, SceneShell, Sparkle } from '../components/ui';

type Id = 'orrery' | 'lighthouse' | 'bridge';

export default function Workshop() {
  const { visit, collect, go } = useStory();
  const [built, setBuilt] = useState<Id[]>([]);
  const [msgDone, setMsgDone] = useState(false);
  const bench = useRef<HTMLDivElement>(null);
  useEffect(() => visit('workshop'), [visit]);

  const build = (id: Id) => {
    if (built.includes(id)) return;
    audio.unlock();
    audio.whoosh(0.7);
    const n = built.length;
    [0, 4, 7, 11].forEach((s, i) => audio.bell(midi(62 + n * 5 + s), 0.5, 0.25 + i * 0.09));
    audio.duck(0.5, 1800);
    const next = [...built, id];
    setBuilt(next);
    if (next.length === 1) window.setTimeout(() => missionControl.say(['Prototype detected.', 'Engineering department is taking notes.']), 1800);
  };

  const all = built.length === 3;

  return (
    <SceneShell label="The Ideas You Haven't Built Yet">
      <header className="scene-header">
        <p className="eyebrow">Door II</p>
        <h1 className="title">
          The Ideas <em>You Haven’t Built Yet</em>
        </h1>
        <p className="hint">{all ? 'All three, built.' : WORKSHOP.hint}</p>
      </header>

      <WorkshopArt />

      {/* sketches */}
      <div style={{ display: 'flex', gap: 12, marginTop: 20, zIndex: 6, minHeight: 112 }}>
        {WORKSHOP.sketches.map((s, i) => (
          <AnimatePresence key={s.id}>
            {!built.includes(s.id as Id) && (
              <motion.div
                drag
                dragSnapToOrigin
                dragElastic={0.9}
                whileDrag={{ scale: 1.1, rotate: 0, zIndex: 20 }}
                initial={{ opacity: 0, y: -10, rotate: (i - 1) * 6 }}
                animate={{ opacity: 1, y: 0, rotate: (i - 1) * 6 }}
                exit={{ opacity: 0, scale: 0.4, y: 160, transition: { duration: 0.6 } }}
                transition={{ delay: 0.4 + i * 0.15 }}
                onTap={() => build(s.id as Id)}
                onDragStart={() => audio.page()}
                onDragEnd={(_, info) => {
                  const r = bench.current?.getBoundingClientRect();
                  if (r && info.point.y > r.top - 40) build(s.id as Id);
                }}
                role="button"
                tabIndex={0}
                aria-label={`Sketch: ${s.label}. Drag onto the workbench.`}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && build(s.id as Id)}
                style={{
                  width: 'min(27vw, 112px)',
                  aspectRatio: '1',
                  background: 'linear-gradient(160deg,#f7f0e4,#e9e1f0)',
                  borderRadius: 4,
                  padding: 8,
                  boxShadow: '0 14px 30px -12px rgba(0,0,0,.7)',
                  cursor: 'grab',
                  touchAction: 'none',
                  position: 'relative',
                }}
              >
                <span style={{ position: 'absolute', top: -6, left: '50%', marginLeft: -6, width: 12, height: 12, borderRadius: '50%', background: '#D8A9B6', boxShadow: '0 2px 4px rgba(0,0,0,.4)' }} />
                <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden>
                  {[20, 40, 60, 80].map((y) => (
                    <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#A79ACD" strokeOpacity=".18" />
                  ))}
                  <ObjectArt id={s.id as Id} mode="sketch" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      <div className="caption" style={{ marginTop: 12, minHeight: 60 }}>
        {all && <Reveal lines={WORKSHOP.message} delay={1.2} gap={2.4} lastClass="gold italic" onDone={() => { setMsgDone(true); collect('passion'); }} />}
      </div>

      {/* workbench */}
      <div
        ref={bench}
        style={{ marginTop: 'auto', marginBottom: msgDone ? 70 : 0, width: 'min(100%, 400px)', position: 'relative', zIndex: 4, transition: 'margin 1s' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: 'min(30vw, 130px)' }}>
          {(['orrery', 'lighthouse', 'bridge'] as Id[]).map((id) => (
            <div key={id} style={{ width: '31%', height: '100%', position: 'relative' }}>
              {built.includes(id) && (
                <motion.svg
                  viewBox="0 0 100 100"
                  width="100%"
                  height="100%"
                  initial={{ y: -80, scale: 0.6, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                  aria-label={WORKSHOP.sketches.find((s) => s.id === id)?.label}
                  role="img"
                >
                  <ObjectArt id={id} mode="built" />
                </motion.svg>
              )}
            </div>
          ))}
        </div>
        <svg viewBox="0 0 400 60" width="100%" aria-hidden style={{ display: 'block' }}>
          <defs>
            <linearGradient id="wk-top" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8a6a78" />
              <stop offset="1" stopColor="#4d3a5a" />
            </linearGradient>
            <radialGradient id="wk-glow" cy="0%">
              <stop offset="0" stopColor="#E9CFA0" stopOpacity={built.length < 3 ? 0.5 : 0.25} />
              <stop offset="1" stopColor="#E9CFA0" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="200" cy="4" rx="200" ry="26" fill="url(#wk-glow)" />
          <rect x="6" y="4" width="388" height="14" rx="3" fill="url(#wk-top)" />
          <rect x="6" y="4" width="388" height="2" fill="#f3dfe6" opacity=".35" />
          <path d="M30 18 L22 60 M370 18 L378 60 M60 18 L64 50 M340 18 L336 50" stroke="#4d3a5a" strokeWidth="6" />
          {built.length < 3 && (
            <text x="200" y="34" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="3" fill="#E9CFA0" opacity=".7">
              DROP SKETCHES HERE
            </text>
          )}
        </svg>
      </div>

      <div className="bottom-dock">
        {msgDone && (
          <Btn variant="gold" onClick={() => go('world2')}>
            Back to the observatory <span className="arrow">→</span>
          </Btn>
        )}
      </div>
    </SceneShell>
  );
}

function WorkshopArt() {
  return (
    <svg className="scene-fill" viewBox="0 0 390 760" preserveAspectRatio="xMidYMid slice" aria-hidden style={{ zIndex: 0 }}>
      <defs>
        <radialGradient id="wk-lamp" cx="50%" cy="0%">
          <stop offset="0" stopColor="#fff1d0" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff1d0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M195 120 L40 700 L350 700Z" fill="url(#wk-lamp)" />
      {/* floating gears and blueprint fragments */}
      {[
        [50, 250, 26],
        [340, 300, 18],
        [320, 520, 30],
        [60, 520, 14],
      ].map(([x, y, r], i) => (
        <g key={i} className="spin-slow" style={{ animationDuration: `${60 + i * 25}s`, animationDirection: i % 2 ? 'reverse' : 'normal' }} opacity=".25">
          <circle cx={x} cy={y} r={r} fill="none" stroke="#E9CFA0" strokeDasharray="4 3" strokeWidth="3" />
          <circle cx={x} cy={y} r={r * 0.4} fill="none" stroke="#E9CFA0" />
        </g>
      ))}
      <path d="M20 420 L90 400 L120 440 M300 180 L360 200 L350 240" stroke="#A79ACD" strokeOpacity=".25" fill="none" strokeDasharray="2 4" />
    </svg>
  );
}

function ObjectArt({ id, mode }: { id: Id; mode: 'sketch' | 'built' }) {
  const sk = mode === 'sketch';
  const line = sk
    ? { stroke: '#6f6aa8', strokeWidth: 1.3, fill: 'none', strokeDasharray: '3 1.5', strokeLinecap: 'round' as const }
    : { stroke: '#E9CFA0', strokeWidth: 1.6, strokeLinecap: 'round' as const };
  const draw = sk ? {} : { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 1.4 } };
  const fillIn = sk ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.9, duration: 1 } };
  const P = motion.path;
  const C = motion.circle;
  const E = motion.ellipse;
  return (
    <g>
      {!sk && (
        <defs>
          <radialGradient id={'ob-' + id}>
            <stop offset="0" stopColor="#E9CFA0" stopOpacity=".45" />
            <stop offset="1" stopColor="#E9CFA0" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={'obf-' + id} x1="0" x2="1">
            <stop offset="0" stopColor="#c9a66b" />
            <stop offset=".45" stopColor="#f6e2b5" />
            <stop offset="1" stopColor="#a87d45" />
          </linearGradient>
        </defs>
      )}
      {!sk && <motion.circle cx="50" cy="55" r="48" fill={`url(#ob-${id})`} {...fillIn} />}
      {id === 'orrery' && (
        <g>
          <E cx="50" cy="44" rx="40" ry="13" {...line} fill="none" {...draw} />
          <E cx="50" cy="44" rx="24" ry="8" {...line} fill="none" {...draw} />
          <C cx="50" cy="44" r="9" {...line} fill={sk ? 'none' : 'url(#obf-orrery)'} {...draw} />
          <C cx="88" cy="48" r="4.5" {...line} fill={sk ? 'none' : '#D8A9B6'} {...draw} />
          <C cx="28" cy="38" r="3.5" {...line} fill={sk ? 'none' : '#A79ACD'} {...draw} />
          <P d="M50 53 L50 86 M36 94 L64 94 L58 86 L42 86Z" {...line} fill={sk ? 'none' : 'url(#obf-orrery)'} {...draw} />
        </g>
      )}
      {id === 'lighthouse' && (
        <g>
          <P d="M40 90 L44 34 L56 34 L60 90Z" {...line} fill={sk ? 'none' : '#F7F0E4'} {...draw} />
          <P d="M41.5 70 L58.5 70 M43 52 L57 52" {...line} stroke={sk ? '#6f6aa8' : '#D8A9B6'} strokeWidth={sk ? 1.3 : 5} {...draw} />
          <P d="M42 34 L58 34 L58 24 L42 24Z M40 24 L50 14 L60 24" {...line} fill={sk ? 'none' : 'url(#obf-lighthouse)'} {...draw} />
          {!sk && <motion.path d="M58 28 L100 16 L100 40Z M42 28 L0 16 L0 40Z" fill="#fff4d6" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0.25, 0.5] }} transition={{ delay: 1.4, duration: 3, repeat: Infinity, repeatType: 'mirror' }} />}
          <P d="M24 94 Q50 82 76 94" {...line} fill="none" {...draw} />
        </g>
      )}
      {id === 'bridge' && (
        <g>
          <P d="M4 70 L96 70" {...line} strokeWidth={sk ? 1.3 : 3} {...draw} />
          <P d="M26 70 L26 30 M74 70 L74 30" {...line} strokeWidth={sk ? 1.3 : 3.4} {...draw} />
          <P d="M4 60 Q26 26 26 30 Q50 64 74 30 Q74 26 96 60" {...line} fill="none" {...draw} />
          <P d="M36 70 L36 46 M44 70 L44 54 M50 70 L50 57 M56 70 L56 54 M64 70 L64 46" {...line} strokeWidth="0.9" {...draw} />
          <P d="M0 86 Q12 80 24 86 T48 86 T72 86 T96 86" {...line} stroke={sk ? '#6f6aa8' : '#A79ACD'} fill="none" {...draw} />
        </g>
      )}
      {!sk && (
        <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.6 }}>
          <Sparkle x={86} y={14} r={6} fill="#F7F0E4" className="twinkle" />
          <Sparkle x={14} y={30} r={4} fill="#E9CFA0" className="twinkle" />
        </motion.g>
      )}
    </g>
  );
}
