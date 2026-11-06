import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { CONSTELLATION, FRAGMENT_NAMES } from '../config/content';
import { audio, midi } from '../core/audio';
import { sky } from '../core/sky';
import { FRAGMENTS, useStory } from '../core/story';
import { Btn, Reveal, SceneShell, Sparkle } from '../components/ui';

const R = 98;
const pos = FRAGMENTS.map((_, k) => {
  const a = ((-90 + k * 60) * Math.PI) / 180;
  return [150 + Math.cos(a) * R, 150 + Math.sin(a) * R] as [number, number];
});

export default function Constellation() {
  const { progress, go } = useStory();
  const [gathered, setGathered] = useState(false);
  const [msgDone, setMsgDone] = useState(false);
  const have = (f: (typeof FRAGMENTS)[number]) => progress.fragments.includes(f);

  useEffect(() => {
    sky.setTheme('gold');
  }, []);

  const gather = () => {
    if (gathered) return;
    audio.unlock();
    setGathered(true);
    audio.duck(0.4, 6000);
    FRAGMENTS.forEach((_, k) => audio.bell(midi([62, 66, 69, 74, 76, 81][k]), 0.6, 0.6 + k * 0.32));
    window.setTimeout(() => audio.swell(), 2600);
  };

  return (
    <SceneShell label="The hidden constellation">
      <header className="scene-header">
        <p className="eyebrow">The Hidden Constellation</p>
        <motion.p className="lede italic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1.6 }}>
          {CONSTELLATION.intro}
        </motion.p>
      </header>

      <div style={{ flex: 1, width: '100%', display: 'grid', placeItems: 'center', minHeight: 0, zIndex: 2 }}>
        <svg viewBox="-10 -10 320 320" style={{ width: 'min(88vw, 400px)', maxHeight: '100%' }} onClick={gather} role="button" aria-label="Draw the fragments together" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && gather()}>
          <defs>
            <radialGradient id="cs-glow">
              <stop offset="0" stopColor="#E9CFA0" stopOpacity=".9" />
              <stop offset="1" stopColor="#E9CFA0" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="cs-bud">
              <stop offset="0" stopColor="#A79ACD" stopOpacity=".8" />
              <stop offset="1" stopColor="#A79ACD" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="-10" y="-10" width="320" height="320" fill="transparent" />
          {gathered && (
            <g>
              {[
                [0, 2],
                [2, 4],
                [4, 0],
                [1, 3],
                [3, 5],
                [5, 1],
              ].map(([a, b], i) => (
                <motion.line
                  key={i}
                  x1={pos[a][0]}
                  y1={pos[a][1]}
                  x2={pos[b][0]}
                  y2={pos[b][1]}
                  stroke="#E9CFA0"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.7 }}
                  transition={{ delay: 2.4 + i * 0.25, duration: 1 }}
                />
              ))}
              <motion.circle cx="150" cy="150" r={R} fill="none" stroke="#E9CFA0" strokeOpacity=".3" strokeDasharray="1 5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4 }} />
            </g>
          )}
          {/* centre star */}
          <motion.g animate={{ scale: gathered ? 1.4 : 1 }} transition={{ duration: 2 }} style={{ transformOrigin: '150px 150px' }}>
            <circle cx="150" cy="150" r="30" fill="url(#cs-glow)" className={gathered ? undefined : 'pulse'} style={{ transformOrigin: '150px 150px' }} />
            <Sparkle x={150} y={150} r={10} fill="#F7F0E4" />
          </motion.g>
          {FRAGMENTS.map((f, k) => {
            const [x, y] = pos[k];
            const on = have(f);
            const startX = 150 + (Math.sin(k * 2.1) * 150);
            const startY = -40 + (k % 3) * 30;
            return (
              <motion.g
                key={f}
                initial={{ x: startX - x, y: startY - y, opacity: 0 }}
                animate={gathered ? { x: 0, y: 0, opacity: 1 } : { x: (startX - x) * 0.6, y: (startY - y) * 0.4 + 60, opacity: 0.8 }}
                transition={gathered ? { delay: 0.4 + k * 0.32, duration: 1.8, ease: [0.22, 0.8, 0.2, 1] } : { delay: 0.8 + k * 0.2, duration: 2.4 }}
              >
                <circle cx={x} cy={y} r="22" fill={on ? 'url(#cs-glow)' : 'url(#cs-bud)'} opacity={on ? 0.9 : 0.55} />
                {on ? (
                  <g transform={`translate(${x} ${y})`}>
                    <path d="M0 -11 L4.5 0 L0 11 L-4.5 0Z" fill="#F7F0E4" />
                    <path d="M0 -11 L4.5 0 L0 0Z" fill="#E9CFA0" />
                  </g>
                ) : (
                  <circle cx={x} cy={y} r="4" fill="#cfc6ea" className="twinkle" />
                )}
                {gathered && (
                  <motion.text
                    x={x + (x - 150) * 0.36}
                    y={y + (y - 150) * 0.32 + (y > 150 ? 18 : y < 100 ? -10 : 5)}
                    textAnchor={x > 160 ? 'start' : x < 140 ? 'end' : 'middle'}
                    fontFamily="Cormorant Garamond, serif"
                    fontStyle="italic"
                    fontSize="15"
                    fill={on ? '#F7F0E4' : '#cfc6ea'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.8 + k * 0.3, duration: 1.2 }}
                  >
                    {FRAGMENT_NAMES[f]}
                    {!on && ' · growing'}
                  </motion.text>
                )}
              </motion.g>
            );
          })}
        </svg>
      </div>

      <div className="caption" style={{ minHeight: 120, marginBottom: msgDone ? 70 : 20 }}>
        {!gathered && (
          <motion.p className="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }}>
            touch the centre star to draw them together
          </motion.p>
        )}
        {gathered && <Reveal lines={CONSTELLATION.message} delay={5.6} gap={2.6} lastClass="gold italic" onDone={() => setMsgDone(true)} />}
      </div>

      <div className="bottom-dock">
        {msgDone && (
          <Btn variant="gold" onClick={() => go('planet23')}>
            Onward to Planet 23 <span className="arrow">→</span>
          </Btn>
        )}
      </div>
    </SceneShell>
  );
}
