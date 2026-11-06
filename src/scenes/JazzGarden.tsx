import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { JAZZ } from '../config/content';
import { audio, midi } from '../core/audio';
import { missionControl } from '../core/missionControl';
import { useStory } from '../core/story';
import { useAfter, useTimeouts } from '../core/util';
import { Btn, Reveal, SceneShell, Sparkle } from '../components/ui';

type Flower = { x: number; y: number; petals: number; color: string; inner: string; size: number; note: number };

const FLOWERS: Flower[] = [
  { x: 58, y: 452, petals: 7, color: '#D8A9B6', inner: '#f6dbe1', size: 1, note: 62 },
  { x: 104, y: 396, petals: 6, color: '#A79ACD', inner: '#dcd3f2', size: 1.12, note: 65 },
  { x: 150, y: 452, petals: 8, color: '#E9CFA0', inner: '#fbefd6', size: 0.95, note: 67 },
  { x: 184, y: 380, petals: 5, color: '#f2c6b8', inner: '#fff0e8', size: 1.05, note: 69 },
  { x: 300, y: 470, petals: 7, color: '#A79ACD', inner: '#e5defa', size: 0.92, note: 72 },
  { x: 330, y: 404, petals: 6, color: '#D8A9B6', inner: '#fbe3e9', size: 1.1, note: 74 },
  { x: 356, y: 474, petals: 8, color: '#E9CFA0', inner: '#fff4dc', size: 0.86, note: 76 },
];

const LICK = [
  { m: 69, t: 0, d: 0.22 },
  { m: 72, t: 0.3, d: 0.16 },
  { m: 74, t: 0.48, d: 0.2 },
  { m: 76, t: 0.72, d: 0.34 },
  { m: 74, t: 1.1, d: 0.16 },
  { m: 72, t: 1.28, d: 0.18 },
  { m: 69, t: 1.5, d: 0.62 },
];

type Particle = { id: number; x: number; y: number; g: string; dx: number };

export default function JazzGarden() {
  const { visit, collect, discover } = useStory();
  const [hits, setHits] = useState<number[]>(FLOWERS.map(() => 0));
  const [particles, setParticles] = useState<Particle[]>([]);
  const [count, setCount] = useState(0);
  const [stage, setStage] = useState<'play' | 'message' | 'done'>('play');
  const [saxGlow, setSaxGlow] = useState(0);
  const [replaying, setReplaying] = useState(false);
  const [fallback, setFallback] = useState(false);
  const melody = useRef<{ i: number; t: number }[]>([]);
  const saxTaps = useRef(0);
  const pid = useRef(0);
  const later = useTimeouts();
  const { go } = useStory();

  useEffect(() => visit('jazz'), [visit]);
  useAfter(26000, () => setFallback(true));

  const burst = (x: number, y: number, n = 4) => {
    const glyphs = ['♪', '♫', '✦', '·', '♩'];
    const items = Array.from({ length: n }, () => ({
      id: pid.current++,
      x,
      y,
      g: glyphs[Math.floor(Math.random() * glyphs.length)],
      dx: (Math.random() - 0.5) * 70,
    }));
    setParticles((p) => [...p.slice(-26), ...items]);
    later(() => setParticles((p) => p.filter((q) => !items.includes(q))), 2600);
  };

  const playFlower = (i: number, record = true) => {
    audio.unlock();
    const f = FLOWERS[i];
    audio.bell(midi(f.note), 0.95);
    audio.duck(0.45, 900);
    setHits((h) => h.map((v, j) => (j === i ? v + 1 : v)));
    setSaxGlow((g) => g + 1);
    burst(f.x, f.y - 20, 3);
    if (!record) return;
    melody.current.push({ i, t: performance.now() });
    if (melody.current.length > 16) melody.current.shift();
    const n = count + 1;
    setCount(n);
    if (n === 6 && stage === 'play') {
      later(() => setStage('message'), 600);
    }
  };

  const playSax = () => {
    audio.unlock();
    audio.play(LICK, 'sax');
    setSaxGlow((g) => g + 3);
    burst(272, 392, 6);
    const joke = JAZZ.saxJokes[saxTaps.current % JAZZ.saxJokes.length];
    saxTaps.current++;
    if (saxTaps.current === 1) discover('sax', joke);
    else missionControl.say([joke]);
  };

  const replay = () => {
    if (replaying || melody.current.length === 0) return;
    setReplaying(true);
    const notes = melody.current.slice(-12);
    let acc = 0;
    notes.forEach((n, k) => {
      if (k > 0) acc += Math.min(650, Math.max(160, n.t - notes[k - 1].t));
      later(() => playFlower(n.i, false), acc);
    });
    later(() => {
      setReplaying(false);
      discover('encore', 'Encore received. The planets are applauding (quietly, it’s space).');
    }, acc + 900);
  };

  const onMessageDone = () => {
    setStage('done');
    collect('creativity');
    later(() => missionControl.say(JAZZ.missionControl), 1600);
  };

  return (
    <SceneShell label="The Jazz Garden">
      <header className="scene-header">
        <p className="eyebrow">Destination 01</p>
        <h1 className="title">
          The <em>Jazz</em> Garden
        </h1>
        <AnimatePresence>
          {stage === 'play' && (
            <motion.p className="hint" exit={{ opacity: 0 }}>
              {JAZZ.hint}
            </motion.p>
          )}
        </AnimatePresence>
      </header>

      <svg
        className="scene-fill"
        viewBox="0 0 390 700"
        preserveAspectRatio="xMidYMax meet"
        style={{ zIndex: 1, transform: stage === 'play' ? 'none' : 'translateY(13vh)', transition: 'transform 2.4s cubic-bezier(.22,.8,.2,1)' }}
      >
        <defs>
          <linearGradient id="jz-aur" x1="0" x2="1">
            <stop offset="0" stopColor="#A79ACD" stopOpacity="0" />
            <stop offset=".4" stopColor="#A79ACD" stopOpacity=".22" />
            <stop offset=".7" stopColor="#D8A9B6" stopOpacity=".16" />
            <stop offset="1" stopColor="#D8A9B6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="jz-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5e58a6" />
            <stop offset=".4" stopColor="#3a3678" />
            <stop offset="1" stopColor="#262458" />
          </linearGradient>
          <linearGradient id="jz-rock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2b2864" />
            <stop offset=".7" stopColor="#1a1a46" />
            <stop offset="1" stopColor="#171B3F" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="jz-sax" x1="0" x2="1">
            <stop offset="0" stopColor="#a87d45" />
            <stop offset=".3" stopColor="#f6e2b5" />
            <stop offset=".55" stopColor="#E9CFA0" />
            <stop offset="1" stopColor="#9b7240" />
          </linearGradient>
          <radialGradient id="jz-glow">
            <stop offset="0" stopColor="#E9CFA0" stopOpacity=".7" />
            <stop offset="1" stopColor="#E9CFA0" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="jz-lantern">
            <stop offset="0" stopColor="#fff3d6" />
            <stop offset=".3" stopColor="#E9CFA0" stopOpacity=".6" />
            <stop offset="1" stopColor="#E9CFA0" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* aurora */}
        <g style={{ animation: 'jz-drift 18s ease-in-out infinite alternate' }}>
          <path d="M-60 210 C40 150 120 260 220 190 C300 140 360 200 460 150 L460 230 C360 280 300 220 220 270 C120 330 40 230 -60 290Z" fill="url(#jz-aur)" />
        </g>
        <g style={{ animation: 'jz-drift 24s ease-in-out infinite alternate-reverse' }} opacity=".7">
          <path d="M-60 290 C60 240 160 330 260 270 C330 230 380 270 460 240 L460 290 C380 320 330 290 260 330 C160 380 60 300 -60 350Z" fill="url(#jz-aur)" />
        </g>

        {/* lanterns */}
        {[
          [44, 250, 0],
          [352, 236, 1.6],
          [70, 330, 3],
          [312, 310, 2.2],
          [200, 230, 4.1],
        ].map(([x, y, d], i) => (
          <g key={i} className="float" style={{ animationDelay: `-${d}s` }}>
            <circle cx={x} cy={y} r="18" fill="url(#jz-lantern)" opacity={0.5 + Math.min(0.5, saxGlow * 0.04)} />
            <Sparkle x={x} y={y} r={4} fill="#fff6e0" />
          </g>
        ))}

        {/* island */}
        <g className="float" style={{ animationDuration: '9s' }}>
          <path
            d="M10 530 C30 600 90 640 150 668 C175 700 210 704 236 676 C290 650 350 610 380 530 Z"
            fill="url(#jz-rock)"
          />
          {[
            'M30 560 Q110 590 200 586 Q290 584 360 556',
            'M60 600 Q140 622 210 618 Q280 612 330 592',
            'M110 640 Q170 656 220 650 Q260 644 290 628',
          ].map((d) => (
            <path key={d} d={d} stroke="#0B1026" strokeOpacity=".35" strokeWidth="2" fill="none" />
          ))}
          {[
            [150, 622, '#E9CFA0'],
            [252, 600, '#A79ACD'],
            [196, 664, '#D8A9B6'],
          ].map(([x, y, c]) => (
            <g key={String(x)}>
              <circle cx={x as number} cy={y as number} r="14" fill="url(#jz-lantern)" opacity=".5" />
              <path d={`M${x} ${(y as number) - 8} L${(x as number) + 4} ${y} L${x} ${(y as number) + 6} L${(x as number) - 4} ${y}Z`} fill={c as string} opacity=".85" />
            </g>
          ))}
          {[70, 120, 250, 320].map((x, i) => (
            <path key={x} d={`M${x} 560 q ${i % 2 ? 6 : -6} 40 ${i % 2 ? -4 : 4} ${60 + i * 10}`} stroke="#8fb3a2" strokeOpacity=".35" fill="none" />
          ))}
          <ellipse cx="195" cy="530" rx="188" ry="34" fill="url(#jz-ground)" />
          <ellipse cx="195" cy="524" rx="176" ry="24" fill="#6c66b4" opacity=".35" />

          {/* saxophone */}
          <g
            role="button"
            aria-label="The saxophone"
            tabIndex={0}
            onClick={playSax}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && playSax()}
            style={{ cursor: 'pointer' }}
          >
            <motion.circle
              cx="250"
              cy="400"
              r="120"
              fill="url(#jz-glow)"
              animate={{ opacity: [0.25 + Math.min(0.5, saxGlow * 0.03), 0.18] }}
              transition={{ duration: 1.8 }}
              key={saxGlow}
            />
            <ellipse cx="248" cy="512" rx="44" ry="7" fill="#1b1946" opacity=".5" />
            <path d="M190 246 C206 250 222 258 228 290" stroke="url(#jz-sax)" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M174 250 L192 242 L194 250 L176 256 Z" fill="#1b1946" />
            <path
              d="M222 286 L240 286 L237 430 Q242 458 255 450 Q264 438 264 398 L298 390 Q290 432 280 456 Q264 492 240 490 Q214 486 214 444 Z"
              fill="url(#jz-sax)"
            />
            <ellipse cx="281" cy="393" rx="17.5" ry="5.5" fill="#6d4d27" transform="rotate(-8 281 393)" />
            <ellipse cx="281" cy="393" rx="13" ry="3.6" fill="#2a1d10" transform="rotate(-8 281 393)" />
            {[306, 328, 350, 372, 394, 416].map((y, k) => (
              <g key={y}>
                <circle cx={229 - k * 0.4} cy={y} r="4" fill="#f9f1e2" stroke="#9b7240" strokeWidth="1" />
                <line x1={236} y1={y} x2={244} y2={y + 6} stroke="#9b7240" strokeWidth="1" />
              </g>
            ))}
            <path d="M244 300 L246 440" stroke="#9b7240" strokeWidth="1" />
            <path d="M226 290 L226 440" stroke="#fff3d6" strokeWidth="1.4" opacity=".55" />
            <rect x="200" y="240" width="110" height="260" fill="transparent" />
          </g>

          {/* flowers */}
          {FLOWERS.map((f, i) => (
            <FlowerArt key={i} f={f} hits={hits[i]} onPlay={() => playFlower(i)} />
          ))}

          {/* grass tufts */}
          {[30, 80, 130, 175, 225, 270, 320, 368].map((x, i) => (
            <path key={x} d={`M${x} ${528 - (i % 2) * 3} q 3 -12 ${i % 2 ? 7 : -5} -18 M${x + 4} 528 q 1 -10 6 -14`} stroke="#9fc6b4" strokeOpacity=".5" fill="none" />
          ))}
        </g>

        {particles.map((p) => (
          <motion.text
            key={p.id}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            fontSize={p.g === '·' ? 26 : 16}
            fill="#E9CFA0"
            initial={{ opacity: 0, y: p.y }}
            animate={{ opacity: [0, 1, 0], y: p.y - 150, x: p.x + p.dx }}
            transition={{ duration: 2.4, ease: 'easeOut' }}
            style={{ pointerEvents: 'none' }}
          >
            {p.g}
          </motion.text>
        ))}
        <style>{`@keyframes jz-drift{from{transform:translateX(-24px)}to{transform:translateX(24px)}}`}</style>
      </svg>

      <div className="caption" style={{ marginTop: '6vh' }}>
        {stage !== 'play' && (
          <Reveal lines={[...JAZZ.message, JAZZ.message2]} gap={2.4} lastClass="gold italic" onDone={onMessageDone} />
        )}
      </div>

      <div className="bottom-dock" style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
        {stage === 'done' && (
          <>
            <Btn onClick={replay} delay={0.6} label="Play back your melody">
              {replaying ? 'Playing…' : '♪ ' + JAZZ.playback}
            </Btn>
            <Btn variant="gold" onClick={() => go('world1')} delay={1.2}>
              Continue <span className="arrow">→</span>
            </Btn>
          </>
        )}
        {stage === 'play' && fallback && (
          <Btn variant="quiet" onClick={() => setStage('message')}>
            Skip ahead softly
          </Btn>
        )}
      </div>
    </SceneShell>
  );
}

function FlowerArt({ f, hits, onPlay }: { f: Flower; hits: number; onPlay: () => void }) {
  const bloom = hits > 0;
  const s = f.size;
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label="A musical flower"
      onPointerDown={(e) => {
        e.preventDefault();
        onPlay();
      }}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPlay()}
      style={{ cursor: 'pointer' }}
    >
      <path d={`M${f.x} 528 C${f.x - 8} ${(528 + f.y) / 2} ${f.x + 8} ${(528 + f.y) / 2} ${f.x} ${f.y + 6}`} stroke="#8fb3a2" strokeWidth="1.6" fill="none" />
      <ellipse cx={f.x + 7} cy={(528 + f.y) / 2 + 10} rx="8" ry="3" fill="#8fb3a2" transform={`rotate(-30 ${f.x + 7} ${(528 + f.y) / 2 + 10})`} />
      <g transform={`translate(${f.x} ${f.y}) scale(${s})`}>
        <motion.circle r="30" fill="url(#jz-glow)" key={'g' + hits} initial={{ opacity: bloom ? 0.9 : 0.25, scale: 1.3 }} animate={{ opacity: bloom ? 0.35 : 0.2, scale: 1 }} transition={{ duration: 1.6 }} />
        <motion.g
          key={hits}
          initial={{ scale: hits ? 1.3 : 0.6, rotate: hits ? -12 : 0 }}
          animate={{ scale: bloom ? 1 : 0.62, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 9 }}
        >
          {Array.from({ length: f.petals }, (_, k) => (
            <ellipse
              key={k}
              cx="0"
              cy="-11"
              rx="6.2"
              ry="12"
              fill={f.color}
              opacity=".92"
              transform={`rotate(${(360 / f.petals) * k})`}
            />
          ))}
          {Array.from({ length: f.petals }, (_, k) => (
            <ellipse key={'i' + k} cx="0" cy="-7" rx="2.6" ry="6" fill={f.inner} opacity=".75" transform={`rotate(${(360 / f.petals) * k + 180 / f.petals})`} />
          ))}
          <circle r="4.6" fill="#fff7e6" />
          <circle r="2" fill="#E9CFA0" />
        </motion.g>
        <circle r="34" fill="transparent" />
      </g>
    </g>
  );
}
