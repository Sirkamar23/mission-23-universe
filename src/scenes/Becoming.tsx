import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { BECOMING } from '../config/content';
import { audio, midi, SCALE } from '../core/audio';
import { useStory } from '../core/story';
import { useAfter, capture } from '../core/util';
import { Btn, SceneShell } from '../components/ui';

export default function Becoming() {
  const { visit, go } = useStory();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [cleared, setCleared] = useState(false);
  const [done, setDone] = useState(false);
  const [fallback, setFallback] = useState(false);
  useEffect(() => visit('becoming'), [visit]);
  useAfter(14000, () => setFallback(true));

  useEffect(() => {
    const c = canvas.current!;
    const g = c.getContext('2d', { willReadFrequently: true });
    if (!g) return;
    const r = c.getBoundingClientRect();
    c.width = Math.round(r.width);
    c.height = Math.round(r.height);
    // paint the stardust
    const grad = g.createLinearGradient(0, 0, c.width, c.height);
    grad.addColorStop(0, 'rgba(167,154,205,0.96)');
    grad.addColorStop(0.5, 'rgba(206,178,196,0.96)');
    grad.addColorStop(1, 'rgba(233,207,160,0.95)');
    g.fillStyle = grad;
    g.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 1400; i++) {
      g.fillStyle = `rgba(255,250,240,${Math.random() * 0.55})`;
      const s = Math.random() * 2.2;
      g.fillRect(Math.random() * c.width, Math.random() * c.height, s, s);
    }
    for (let i = 0; i < 40; i++) {
      g.fillStyle = 'rgba(255,255,255,.85)';
      g.beginPath();
      g.arc(Math.random() * c.width, Math.random() * c.height, Math.random() * 1.6 + 0.5, 0, Math.PI * 2);
      g.fill();
    }
  }, []);

  const strokes = useRef(0);
  const lastNote = useRef(0);
  const brush = (x: number, y: number) => {
    const c = canvas.current;
    if (!c || cleared) return;
    const g = c.getContext('2d');
    if (!g) return;
    const r = c.getBoundingClientRect();
    const px = ((x - r.left) / r.width) * c.width;
    const py = ((y - r.top) / r.height) * c.height;
    g.globalCompositeOperation = 'destination-out';
    const rad = 38;
    const grd = g.createRadialGradient(px, py, 0, px, py, rad);
    grd.addColorStop(0, 'rgba(0,0,0,1)');
    grd.addColorStop(0.6, 'rgba(0,0,0,.8)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.beginPath();
    g.arc(px, py, rad, 0, Math.PI * 2);
    g.fill();
    g.globalCompositeOperation = 'source-over';
    const now = performance.now();
    if (now - lastNote.current > 140) {
      lastNote.current = now;
      audio.bell(midi(SCALE[Math.floor(Math.random() * 6) + 4] + 12), 0.18);
    }
    if (++strokes.current % 12 === 0) {
      const data = g.getImageData(0, 0, c.width, c.height).data;
      let clear = 0;
      let total = 0;
      for (let i = 3; i < data.length; i += 4 * 97) {
        total++;
        if (data[i] < 60) clear++;
      }
      if (clear / total > 0.52) finish();
    }
  };

  const finish = () => {
    if (cleared) return;
    setCleared(true);
    audio.swell();
  };

  return (
    <SceneShell label="The Person You're Still Becoming">
      <header className="scene-header">
        <p className="eyebrow">Door IV</p>
        <h1 className="title">
          The Person <em>You’re Still Becoming</em>
        </h1>
        <p className="hint">{cleared ? ' ' : BECOMING.hint}</p>
      </header>

      <div style={{ position: 'relative', width: 'min(88vw, 400px)', flex: 1, maxHeight: 520, minHeight: 300, marginTop: 14, zIndex: 2 }}>
        {/* the window */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '200px 200px 14px 14px',
            overflow: 'hidden',
            border: '1px solid rgba(233,207,160,.5)',
            boxShadow: '0 0 60px -10px rgba(233,207,160,.35), inset 0 0 0 6px rgba(11,16,38,.6)',
          }}
        >
          <Universe />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 16, padding: '40px 26px', textAlign: 'center' }}>
            {BECOMING.message.map((l, i) => (
              <motion.p
                key={l}
                className={'lede glow-text' + (i === 2 ? ' italic gold' : '')}
                style={{ fontSize: 'clamp(19px,5.4vw,24px)' }}
                initial={{ opacity: 0.85 }}
                animate={cleared ? { opacity: [0.85, 0.2, 1], filter: ['blur(0px)', 'blur(4px)', 'blur(0px)'] } : {}}
                transition={{ delay: 1 + i * 2.2, duration: 2 }}
                onAnimationComplete={() => cleared && i === 2 && setDone(true)}
              >
                {l}
              </motion.p>
            ))}
          </div>
          <motion.canvas
            ref={canvas}
            aria-label="Stardust covering the glass. Brush it away."
            role="img"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none' }}
            animate={{ opacity: cleared ? 0 : 1 }}
            transition={{ duration: 2.2 }}
            onPointerDown={(e) => {
              audio.unlock();
              capture(e);
              brush(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (e.pointerType === 'mouse' && e.buttons === 0) return;
              brush(e.clientX, e.clientY);
            }}
          />
          {/* window mullions */}
          <svg viewBox="0 0 100 130" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden>
            <line x1="50" y1="0" x2="50" y2="130" stroke="#E9CFA0" strokeOpacity=".22" strokeWidth=".4" />
            <line x1="0" y1="86" x2="100" y2="86" stroke="#E9CFA0" strokeOpacity=".22" strokeWidth=".4" />
          </svg>
        </div>
      </div>

      {/* the balcony */}
      <svg viewBox="0 0 400 60" style={{ width: 'min(100%, 420px)', marginTop: -6, zIndex: 3, position: 'relative' }} aria-hidden>
        <rect x="0" y="6" width="400" height="6" rx="2" fill="#2b2a5e" />
        {Array.from({ length: 17 }, (_, i) => (
          <path key={i} d={`M${12 + i * 23.5} 12 q-5 12 0 22 q5 10 0 22`} stroke="#2b2a5e" strokeWidth="5" fill="none" />
        ))}
        <rect x="0" y="56" width="400" height="4" fill="#2b2a5e" />
        <rect x="0" y="6" width="400" height="1.2" fill="#E9CFA0" opacity=".4" />
      </svg>

      <div className="bottom-dock">
        {done && (
          <Btn variant="gold" onClick={() => go('world2')} delay={0.6}>
            Back to the observatory <span className="arrow">→</span>
          </Btn>
        )}
        {!cleared && fallback && (
          <Btn variant="quiet" onClick={finish}>
            Brush it all away
          </Btn>
        )}
      </div>
    </SceneShell>
  );
}

function Universe() {
  return (
    <svg viewBox="0 0 200 260" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden>
      <defs>
        <radialGradient id="bc-sky" cx="50%" cy="60%" r="80%">
          <stop offset="0" stopColor="#5b4a7e" />
          <stop offset=".5" stopColor="#25235a" />
          <stop offset="1" stopColor="#0f1236" />
        </radialGradient>
        <radialGradient id="bc-core">
          <stop offset="0" stopColor="#fff6e0" stopOpacity=".95" />
          <stop offset=".3" stopColor="#E9CFA0" stopOpacity=".5" />
          <stop offset="1" stopColor="#D8A9B6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="260" fill="url(#bc-sky)" />
      <g className="spin-slow" style={{ transformOrigin: '100px 150px', transformBox: 'view-box', animationDuration: '140s' }}>
        {Array.from({ length: 220 }, (_, i) => {
          const arm = i % 3;
          const t = (i / 220) * 5.5;
          const a = t + (arm * Math.PI * 2) / 3;
          const r = 6 + t * 15;
          const jitter = Math.sin(i * 12.9898) * 5;
          return (
            <circle
              key={i}
              cx={100 + Math.cos(a) * r + jitter}
              cy={150 + Math.sin(a) * r * 0.55 + jitter * 0.5}
              r={0.4 + (i % 4) * 0.25}
              fill={['#F7F0E4', '#E9CFA0', '#D8A9B6', '#A79ACD'][i % 4]}
              opacity={0.35 + (i % 5) * 0.12}
            />
          );
        })}
      </g>
      <ellipse cx="100" cy="150" rx="40" ry="22" fill="url(#bc-core)" />
      {Array.from({ length: 50 }, (_, i) => (
        <circle key={'s' + i} cx={(i * 53) % 200} cy={(i * 97) % 260} r={(i % 3) * 0.3 + 0.3} fill="#fff" opacity=".7" />
      ))}
    </svg>
  );
}
