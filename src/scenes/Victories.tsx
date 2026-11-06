import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { VICTORIES } from '../config/content';
import { audio, midi, SCALE } from '../core/audio';
import { missionControl } from '../core/missionControl';
import { useStory } from '../core/story';
import { svgPoint, capture } from '../core/util';
import { Btn, Reveal, SceneShell, Sparkle } from '../components/ui';
import { SAX_STARS } from '../components/Keepsake';

export default function Victories() {
  const { visit, collect, go } = useStory();
  const [c, setC] = useState(0);
  const [finger, setFinger] = useState<{ x: number; y: number } | null>(null);
  const [complete, setComplete] = useState(false);
  const [msgDone, setMsgDone] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const last = SAX_STARS.length - 1;

  useEffect(() => visit('victories'), [visit]);

  const cRef = useRef(0);
  const connect = () => {
    const cur = cRef.current;
    if (cur >= last) return;
    const n = cur + 1;
    cRef.current = n;
    setC(n);
    audio.bell(midi(SCALE[n + 1]), 0.85);
    audio.duck(0.5, 1200);
    if (n === last) {
      window.setTimeout(() => {
        setComplete(true);
        setFinger(null);
        audio.swell();
      }, 700);
    }
  };

  const onMove = (x: number, y: number) => {
    if (!svg.current || complete) return;
    const p = svgPoint(svg.current, x, y);
    setFinger(p);
    const cur = cRef.current;
    if (cur < last) {
      const [nx, ny] = SAX_STARS[cur + 1];
      if (Math.hypot(p.x - nx, p.y - ny) < 17) connect();
    }
  };

  return (
    <SceneShell label="The Constellation of Small Victories">
      <header className="scene-header">
        <p className="eyebrow">Destination 04</p>
        <h1 className="title">
          The Constellation of <em>Small Victories</em>
        </h1>
        <p className="hint">{complete ? 'Saved to your keepsakes.' : VICTORIES.hint}</p>
      </header>

      <div style={{ position: 'relative', flex: 1, width: '100%', display: 'grid', placeItems: 'center', zIndex: 2, minHeight: 0 }}>
        <motion.svg
          ref={svg}
          viewBox="-20 -10 240 290"
          style={{ width: 'min(86vw, 380px)', maxHeight: '100%', touchAction: 'none' }}
          animate={complete ? { scale: 0.86, y: -20 } : { scale: 1, y: 0 }}
          transition={{ duration: 2, ease: [0.22, 0.8, 0.2, 1] }}
          onPointerDown={(e) => {
            audio.unlock();
            capture(e);
            onMove(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (e.buttons === 0 && e.pointerType === 'mouse') return;
            onMove(e.clientX, e.clientY);
          }}
          onPointerUp={() => setFinger(null)}
          onPointerCancel={() => setFinger(null)}
        >
          <defs>
            <radialGradient id="vc-glow">
              <stop offset="0" stopColor="#E9CFA0" stopOpacity=".85" />
              <stop offset="1" stopColor="#E9CFA0" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="-20" y="-10" width="240" height="290" fill="transparent" />
          {/* faint guide */}
          {SAX_STARS.slice(0, -1).map(([x, y], i) => (
            <line key={'g' + i} x1={x} y1={y} x2={SAX_STARS[i + 1][0]} y2={SAX_STARS[i + 1][1]} stroke="#A79ACD" strokeOpacity={i >= c ? 0.12 : 0} strokeDasharray="1 5" />
          ))}
          {/* connections */}
          {SAX_STARS.slice(0, -1).map(([x, y], i) =>
            i < c ? (
              <motion.line
                key={i}
                x1={x}
                y1={y}
                x2={SAX_STARS[i + 1][0]}
                y2={SAX_STARS[i + 1][1]}
                stroke="#E9CFA0"
                strokeWidth={complete ? 1.6 : 1.2}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: complete ? 1 : 0.85 }}
                transition={{ duration: 0.5 }}
              />
            ) : null,
          )}
          {finger && c < last && (
            <line x1={SAX_STARS[c][0]} y1={SAX_STARS[c][1]} x2={finger.x} y2={finger.y} stroke="#F7F0E4" strokeOpacity=".5" strokeWidth="1" strokeDasharray="3 3" />
          )}
          {SAX_STARS.map(([x, y], i) => {
            const on = i <= c;
            const next = i === c + 1;
            return (
              <g
                key={i}
                onClick={() => next && connect()}
                role={next ? 'button' : undefined}
                aria-label={next ? 'Next star' : undefined}
                tabIndex={next ? 0 : -1}
                onKeyDown={(e) => next && (e.key === 'Enter' || e.key === ' ') && connect()}
              >
                <circle cx={x} cy={y} r={on ? 20 : 14} fill="url(#vc-glow)" opacity={on ? (complete ? 1 : 0.75) : next ? 0.5 : 0.15} className={next ? 'pulse' : undefined} style={{ transformOrigin: `${x}px ${y}px` }} />
                <Sparkle x={x} y={y} r={on ? 7 : next ? 6 : 4} fill={on ? '#F7F0E4' : '#cfc6ea'} />
                <circle cx={x} cy={y} r="22" fill="transparent" />
              </g>
            );
          })}
          {complete && (
            <motion.text
              x="100"
              y="268"
              textAnchor="middle"
              fontFamily="Cormorant Garamond, serif"
              fontStyle="italic"
              fontSize="17"
              fill="#E9CFA0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1.5 }}
            >
              {VICTORIES.constellationName}
            </motion.text>
          )}
        </motion.svg>
      </div>

      <div className="caption" style={{ minHeight: 110, marginBottom: msgDone ? 70 : 10, justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {!complete && c > 0 && (
            <motion.div key={c} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.6 }}>
              <p className="eyebrow">Small victory {c} of {last}</p>
              <p className="lede italic" style={{ fontSize: 22 }}>
                {VICTORIES.reminders[c - 1]}
              </p>
            </motion.div>
          )}
          {complete && (
            <motion.div key="msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Reveal
                lines={VICTORIES.message}
                delay={1.8}
                gap={2.4}
                lastClass="gold italic"
                onDone={() => {
                  setMsgDone(true);
                  collect('persistence');
                  window.setTimeout(() => missionControl.say(['Constellation catalogued.', 'Mission status: suspiciously impressive.']), 1500);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bottom-dock">
        {msgDone && (
          <Btn variant="gold" onClick={() => go('world1')}>
            Continue <span className="arrow">→</span>
          </Btn>
        )}
      </div>
    </SceneShell>
  );
}
