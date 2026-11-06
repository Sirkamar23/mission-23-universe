import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { MUSIC_HALL } from '../config/content';
import { audio } from '../core/audio';
import { useStory } from '../core/story';
import { useTimeouts } from '../core/util';
import { Btn, Reveal, SceneShell, Sparkle } from '../components/ui';

const SCALE = [62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79];
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

/** A brand-new phrase every time: a small random walk through D dorian that resolves home. */
function improvise() {
  const beat = 60 / 86;
  let idx = 4 + Math.floor(Math.random() * 3);
  let t = 0;
  const notes: { m: number; t: number; d: number; v: number }[] = [];
  const n = 8 + Math.floor(Math.random() * 4);
  for (let i = 0; i < n; i++) {
    idx = Math.max(0, Math.min(SCALE.length - 1, idx + pick([-2, -1, -1, 1, 1, 2, 3, -3])));
    const len = pick([0.5, 0.5, 0.5, 0.75, 1, 1.5]) * beat;
    const swing = i % 2 === 0 ? 1.15 : 0.85;
    notes.push({ m: SCALE[idx], t, d: len * 0.92, v: 0.75 + Math.random() * 0.25 });
    t += len * swing;
  }
  notes.push({ m: pick([62, 69, 74]), t: t + 0.08, d: beat * 2.4, v: 0.9 });
  return notes;
}

export default function MusicHall() {
  const { visit, discover, go } = useStory();
  const [plays, setPlays] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [glyphs, setGlyphs] = useState<{ id: number; x: number; m: number }[]>([]);
  const [msg, setMsg] = useState(false);
  const [done, setDone] = useState(false);
  const gid = useRef(0);
  const later = useTimeouts();

  useEffect(() => visit('music'), [visit]);

  const perform = () => {
    if (playing) return;
    audio.unlock();
    const notes = improvise();
    setPlaying(true);
    audio.play(notes, 'sax');
    // a soft chord bed underneath
    [50, 57, 64, 65].forEach((m, i) => audio.bell(440 * Math.pow(2, (m - 69) / 12), 0.28, i * 0.04));
    notes.forEach((n) =>
      later(() => {
        setPulse((p) => p + 1);
        const id = gid.current++;
        setGlyphs((g) => [...g.slice(-16), { id, x: (Math.random() - 0.5) * 120, m: n.m }]);
      }, n.t * 1000),
    );
    const end = notes[notes.length - 1];
    later(() => {
      setPlaying(false);
      const p = plays + 1;
      setPlays(p);
      if (p === 1) setMsg(true);
      if (p === 3) discover('improviser', MUSIC_HALL.improviser);
    }, (end.t + end.d) * 1000 + 400);
  };

  return (
    <SceneShell label="The Music You Haven't Played Yet">
      <header className="scene-header">
        <p className="eyebrow">Door I</p>
        <h1 className="title">
          The Music <em>You Haven’t Played Yet</em>
        </h1>
        <p className="hint">{plays ? 'Every time, the universe improvises something new.' : MUSIC_HALL.hint}</p>
      </header>

      <svg
        className="scene-fill"
        viewBox="0 0 390 760"
        preserveAspectRatio="xMidYMax meet"
        style={{ zIndex: 1, cursor: 'pointer' }}
        onClick={perform}
        role="button"
        aria-label="Touch the stage to hear a melody"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && perform()}
      >
        <defs>
          <linearGradient id="mh-spot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff3d6" stopOpacity=".05" />
            <stop offset="1" stopColor="#fff3d6" stopOpacity=".42" />
          </linearGradient>
          <radialGradient id="mh-stage" cx="50%" cy="20%">
            <stop offset="0" stopColor="#E9CFA0" stopOpacity=".55" />
            <stop offset="1" stopColor="#3a2f6a" stopOpacity=".2" />
          </radialGradient>
          <linearGradient id="mh-sax" x1="0" x2="1">
            <stop offset="0" stopColor="#1a1640" />
            <stop offset=".5" stopColor="#3a2f5e" />
            <stop offset="1" stopColor="#120f30" />
          </linearGradient>
        </defs>
        {/* receding arches */}
        {[0, 1, 2, 3].map((k) => {
          const w = 180 - k * 36;
          const top = 220 + k * 34;
          const lit = playing ? 0.25 + ((pulse + k) % 4 === 0 ? 0.5 : 0) : 0.22;
          return (
            <path
              key={k}
              d={`M${195 - w} 640 L${195 - w} ${top + w * 0.7} Q${195 - w} ${top} 195 ${top - 10} Q${195 + w} ${top} ${195 + w} ${top + w * 0.7} L${195 + w} 640`}
              fill="none"
              stroke="#E9CFA0"
              strokeOpacity={lit}
              strokeWidth={1.4 - k * 0.2}
              style={{ transition: 'stroke-opacity .4s' }}
            />
          );
        })}
        {/* audience of stars */}
        {Array.from({ length: 40 }, (_, i) => {
          const row = Math.floor(i / 10);
          const x = 30 + (i % 10) * 37 + (row % 2) * 16;
          const y = 690 + row * 18;
          return <circle key={i} cx={x} cy={y} r={1.2 + row * 0.4} fill="#F7F0E4" opacity={playing && (i + pulse) % 5 === 0 ? 0.95 : 0.35} style={{ transition: 'opacity .3s' }} />;
        })}
        {/* stage */}
        <ellipse cx="195" cy="640" rx="170" ry="34" fill="url(#mh-stage)" />
        <ellipse cx="195" cy="640" rx="170" ry="34" fill="none" stroke="#E9CFA0" strokeOpacity=".5" />
        <path d="M150 300 L240 300 L330 640 L60 640Z" fill="url(#mh-spot)" opacity={playing ? 1 : 0.6} style={{ transition: 'opacity 1s' }} />
        {/* sound rings */}
        <motion.ellipse key={pulse} cx="230" cy="520" rx="20" ry="10" fill="none" stroke="#E9CFA0" initial={{ scale: 0.6, opacity: 0.8 }} animate={{ scale: 5, opacity: 0 }} transition={{ duration: 1.6 }} style={{ transformOrigin: '230px 520px' }} />
        {/* saxophone silhouette on its stand */}
        <g>
          <path d="M176 636 L196 590 L216 636 M196 590 L196 560" stroke="#E9CFA0" strokeOpacity=".6" strokeWidth="2" fill="none" />
          <path d="M168 404 C180 404 194 410 198 432" stroke="url(#mh-sax)" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M193 428 L207 428 L205 548 Q209 572 222 566 Q230 556 230 522 L258 514 Q252 552 244 572 Q230 600 210 598 Q186 594 186 560 Z" fill="url(#mh-sax)" stroke="#E9CFA0" strokeOpacity=".7" strokeWidth="1.2" />
          <ellipse cx="244" cy="517" rx="15" ry="4.5" fill="#E9CFA0" opacity={playing ? 0.9 : 0.4} transform="rotate(-8 244 517)" style={{ transition: 'opacity .4s' }} />
        </g>
        <Sparkle x={196} y={250} r={8} fill="#F7F0E4" className="twinkle" />
        {glyphs.map((g) => (
          <motion.text
            key={g.id}
            x={244}
            y={505}
            fontSize={18 + (g.m - 62)}
            fill="#E9CFA0"
            textAnchor="middle"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0], x: 244 + g.x, y: 505 - 180 - (g.m - 62) * 8 }}
            transition={{ duration: 2.8, ease: 'easeOut' }}
          >
            {g.m > 70 ? '♪' : '♩'}
          </motion.text>
        ))}
      </svg>

      <div className="caption" style={{ marginTop: '4vh' }}>
        {msg && (
          <Reveal
            lines={MUSIC_HALL.message}
            gap={2.6}
            lastClass="gold italic"
            onDone={() => setDone(true)}
          />
        )}
      </div>

      <div className="bottom-dock" style={{ flexDirection: 'row', justifyContent: 'center' }}>
        {done && (
          <>
            <Btn variant="quiet" onClick={perform}>
              {playing ? 'Listening…' : 'Another melody'}
            </Btn>
            <Btn variant="gold" onClick={() => go('world2')}>
              Back to the observatory <span className="arrow">→</span>
            </Btn>
          </>
        )}
      </div>
    </SceneShell>
  );
}
