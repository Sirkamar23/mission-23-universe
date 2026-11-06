import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState, type CSSProperties } from 'react';
import { LIBRARY } from '../config/content';
import { audio } from '../core/audio';
import { missionControl } from '../core/missionControl';
import { useStory } from '../core/story';
import { useAfter } from '../core/util';
import { Btn, SceneShell, Sparkle } from '../components/ui';

const SPOTS: [number, number, number][] = [
  [92, 250, -12],
  [292, 232, 10],
  [196, 372, -5],
  [86, 488, 9],
  [300, 470, -14],
];

export default function Library() {
  const { visit, collect, discover, go } = useStory();
  const [open, setOpen] = useState<number | null>(null);
  const [read, setRead] = useState<number[]>([]);
  const [fallback, setFallback] = useState(false);
  useEffect(() => visit('library'), [visit]);
  useAfter(30000, () => setFallback(true));

  const openBook = (i: number) => {
    audio.unlock();
    audio.page();
    setOpen(i);
    if (!read.includes(i)) {
      const r = [...read, i];
      setRead(r);
      if (r.length === 3) {
        window.setTimeout(() => {
          collect('curiosity');
          missionControl.say(LIBRARY.missionControl);
        }, 2600);
      }
    }
  };

  const done = read.length >= 3;

  return (
    <SceneShell label="The Library of Unfinished Ideas">
      <header className="scene-header">
        <p className="eyebrow">Destination 02</p>
        <h1 className="title">
          The Library of <em>Unfinished Ideas</em>
        </h1>
        <p className="hint">{done ? `${read.length} of ${LIBRARY.books.length} books read · keep browsing or continue` : LIBRARY.hint}</p>
      </header>

      <svg className="scene-fill" viewBox="0 0 390 700" preserveAspectRatio="xMidYMid meet" style={{ zIndex: 1 }}>
        <defs>
          <linearGradient id="lb-win" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#262a68" />
            <stop offset="1" stopColor="#3d3474" />
          </linearGradient>
          <linearGradient id="lb-shelf" x1="0" x2="1">
            <stop offset="0" stopColor="#131635" />
            <stop offset="1" stopColor="#20244f" />
          </linearGradient>
          <radialGradient id="lb-lamp">
            <stop offset="0" stopColor="#fff1d0" stopOpacity=".9" />
            <stop offset=".4" stopColor="#E9CFA0" stopOpacity=".25" />
            <stop offset="1" stopColor="#E9CFA0" stopOpacity="0" />
          </radialGradient>
          <clipPath id="lb-clip">
            <path d="M95 640 L95 260 Q95 150 195 140 Q295 150 295 260 L295 640Z" />
          </clipPath>
        </defs>

        {/* great arched window */}
        <path d="M86 650 L86 258 Q86 138 195 128 Q304 138 304 258 L304 650Z" fill="none" stroke="#E9CFA0" strokeOpacity=".35" strokeWidth="1.2" />
        <path d="M95 640 L95 260 Q95 150 195 140 Q295 150 295 260 L295 640Z" fill="url(#lb-win)" opacity=".55" />
        <g clipPath="url(#lb-clip)" opacity=".8">
          <circle cx="240" cy="230" r="26" fill="#F7F0E4" opacity=".08" />
          {Array.from({ length: 26 }, (_, i) => (
            <circle key={i} cx={100 + ((i * 73) % 190)} cy={150 + ((i * 131) % 480)} r={(i % 4) * 0.35 + 0.5} fill="#F7F0E4" className="twinkle" style={{ animationDelay: `${-i * 0.37}s` }} />
          ))}
          <line x1="195" y1="140" x2="195" y2="640" stroke="#E9CFA0" strokeOpacity=".18" />
          <line x1="95" y1="380" x2="295" y2="380" stroke="#E9CFA0" strokeOpacity=".18" />
        </g>

        {/* shelves curving at the edges */}
        {[0, 1].map((side) => (
          <g key={side} transform={side ? 'translate(390 0) scale(-1 1)' : undefined}>
            <path d="M-10 160 Q46 170 58 220 L58 700 L-10 700Z" fill="url(#lb-shelf)" />
            {[260, 340, 420, 500, 580].map((y, r) => (
              <g key={y}>
                <line x1="-10" y1={y} x2="58" y2={y} stroke="#E9CFA0" strokeOpacity=".3" />
                {Array.from({ length: 7 }, (_, k) => (
                  <rect
                    key={k}
                    x={-4 + k * 8.4}
                    y={y - 30 + ((k + r) % 3) * 4}
                    width="6.6"
                    height={30 - ((k + r) % 3) * 4}
                    fill={['#A79ACD', '#D8A9B6', '#E9CFA0', '#5b5fa8', '#c98f86'][(k + r * 2) % 5]}
                    opacity=".55"
                  />
                ))}
              </g>
            ))}
          </g>
        ))}

        {/* floating reading ledge */}
        <g className="float" style={{ animationDuration: '10s' }}>
          <path d="M110 612 L280 612 L268 630 Q195 660 122 630Z" fill="#232860" />
          <rect x="108" y="604" width="174" height="10" rx="3" fill="#2f3577" />
          <circle cx="250" cy="572" r="60" fill="url(#lb-lamp)" />
          <path d="M250 604 L250 572 M238 572 L262 572 L256 556 L244 556Z" stroke="#E9CFA0" fill="#E9CFA0" strokeWidth="1.2" />
          {[0, 1, 2].map((k) => (
            <rect key={k} x={130} y={592 - k * 7} width={60 - k * 8} height="6" rx="1" fill={['#D8A9B6', '#A79ACD', '#E9CFA0'][k]} />
          ))}
        </g>

        {/* drifting books */}
        {LIBRARY.books.map((b, i) => {
          const [x, y, r] = SPOTS[i];
          const wasRead = read.includes(i);
          return (
            <g
              key={i}
              role="button"
              tabIndex={0}
              aria-label={`Open the book “${b.title}”`}
              onClick={() => openBook(i)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openBook(i)}
              style={{ cursor: 'pointer' }}
            >
              <g className="float" style={{ animationDelay: `${-i * 1.3}s`, animationDuration: `${6 + i}s` }}>
                <g transform={`translate(${x} ${y}) rotate(${r})`}>
                  <ellipse cx="0" cy="44" rx="26" ry="4" fill="#000" opacity=".18" />
                  <rect x="-24" y="-32" width="50" height="66" rx="3" fill="#f3ead8" />
                  <rect x="-26" y="-34" width="48" height="66" rx="3" fill={b.color} />
                  <rect x="-26" y="-34" width="7" height="66" rx="2" fill="#000" opacity=".16" />
                  <rect x="-14" y="-18" width="28" height="12" rx="1" fill="none" stroke="#fff7e6" strokeOpacity=".7" />
                  <line x1="-12" y1="16" x2="12" y2="16" stroke="#fff7e6" strokeOpacity=".5" />
                  {LIBRARY.books[i].secret && <path d="M22 -20 L30 -24 L28 -12Z" fill="#F7F0E4" />}
                  {wasRead && <Sparkle x={20} y={-38} r={6} fill="#E9CFA0" />}
                  <rect x="-40" y="-50" width="80" height="100" fill="transparent" />
                </g>
              </g>
            </g>
          );
        })}
      </svg>

      <AnimatePresence>{open !== null && <OpenBook i={open} onClose={() => setOpen(null)} onSecret={() => discover('marginalia')} />}</AnimatePresence>

      <div className="bottom-dock">
        {(done || fallback) && open === null && (
          <Btn variant={done ? 'gold' : 'quiet'} onClick={() => go('world1')} delay={0.4}>
            Continue <span className="arrow">→</span>
          </Btn>
        )}
      </div>
    </SceneShell>
  );
}

function OpenBook({ i, onClose, onSecret }: { i: number; onClose: () => void; onSecret: () => void }) {
  const b = LIBRARY.books[i];
  const [note, setNote] = useState(false);
  const W = Math.min(window.innerWidth * 0.44, 190);
  const H = Math.min(window.innerWidth * 0.64, 290);
  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        display: 'grid',
        placeItems: 'center',
        background: 'radial-gradient(70% 50% at 50% 50%, rgba(11,16,38,.55), rgba(6,8,20,.9))',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.3 } }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={b.title}
    >
      <motion.div
        style={{ position: 'relative', width: W * 2, height: H, perspective: 1600 }}
        initial={{ x: -W / 2, scale: 0.5, y: 60, rotate: -6 }}
        animate={{ x: 0, scale: 1, y: 0, rotate: 0 }}
        exit={{ x: -W / 2, scale: 0.5, y: 60, opacity: 0 }}
        transition={{ duration: 1.1, ease: [0.22, 0.8, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* right page (the message) */}
        <div style={{ ...page, left: '50%', borderRadius: '2px 6px 6px 2px', background: 'linear-gradient(90deg,#e8dcc4 0%,#f7f0e4 9%,#fbf6ec 100%)' }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(16px,4.4vw,20px)', lineHeight: 1.35, color: '#2b2445', margin: 0, fontStyle: 'italic' }}>{b.text}</p>
          <span style={{ position: 'absolute', bottom: 10, right: 14, fontFamily: 'var(--mono)', fontSize: 9, color: '#9a8f80' }}>{i * 2 + 23}</span>
          {b.secret && (
            <button
              aria-label="A folded note tucked in the margin"
              onClick={() => {
                setNote(true);
                audio.page();
                onSecret();
              }}
              style={{ position: 'absolute', top: -14, right: 12, width: 44, height: 44, display: 'grid', placeItems: 'center' }}
            >
              <svg width="26" height="30" viewBox="0 0 26 30" aria-hidden>
                <path d="M3 4 L23 2 L22 28 L4 27Z" fill="#fffaf0" stroke="#d8c8a8" />
                <path d="M15 2.6 L23 2 L22.4 10Z" fill="#e9dcc2" />
                <path d="M7 12 L18 11 M7 16 L16 15.5" stroke="#c9b48e" />
              </svg>
            </button>
          )}
        </div>
        {/* cover that swings open; its back is the left page */}
        <motion.div
          style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '50%', transformOrigin: '0% 50%', transformStyle: 'preserve-3d' }}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: -178 }}
          exit={{ rotateY: 0, transition: { duration: 0.7 } }}
          transition={{ duration: 1.3, delay: 0.45, ease: [0.5, 0, 0.2, 1] }}
        >
          <div style={{ ...face, background: `linear-gradient(90deg, rgba(0,0,0,.18), transparent 12%), ${b.color}`, borderRadius: '2px 7px 7px 2px', boxShadow: '0 20px 40px -14px rgba(0,0,0,.7)' }}>
            <div style={{ border: '1px solid rgba(255,247,230,.6)', padding: '14px 10px', margin: 18, textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, color: '#fffaf0' }}>
              {b.title}
            </div>
          </div>
          <div style={{ ...face, transform: 'rotateY(180deg)', background: 'linear-gradient(270deg,#e8dcc4 0%,#f7f0e4 9%,#fbf6ec 100%)', borderRadius: '6px 2px 2px 6px', padding: '18px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '.28em', color: '#9a8f80', textTransform: 'uppercase' }}>Unfinished ideas</span>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 22, color: '#2b2445', textAlign: 'center', lineHeight: 1.1 }}>{b.title}</span>
            <svg width="60" height="16" viewBox="0 0 60 16" aria-hidden>
              <path d="M2 8 H24 M36 8 H58" stroke="#c9a66b" />
              <path d="M30 2 L33 8 L30 14 L27 8Z" fill="#c9a66b" />
            </svg>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {note && (
          <motion.div
            initial={{ opacity: 0, y: 20, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', bottom: 'calc(var(--safe-b) + 100px)', left: 24, right: 24, maxWidth: 340, margin: '0 auto', background: '#fffaf0', color: '#2b2445', padding: '14px 18px', borderRadius: 4, fontFamily: 'var(--hand)', fontSize: 23, lineHeight: 1.2, boxShadow: '0 14px 30px -10px rgba(0,0,0,.6)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {LIBRARY.secretNote}
          </motion.div>
        )}
      </AnimatePresence>
      <p className="hint" style={{ position: 'absolute', bottom: 'calc(var(--safe-b) + 40px)' }}>
        tap outside the book to close
      </p>
    </motion.div>
  );
}

const page: CSSProperties = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: '50%',
  padding: '22px 18px',
  display: 'flex',
  alignItems: 'center',
  boxShadow: '0 24px 50px -16px rgba(0,0,0,.75)',
};
const face: CSSProperties = {
  position: 'absolute',
  inset: 0,
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
};
