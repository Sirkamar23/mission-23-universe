import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { PLACES } from '../config/content';
import { audio, midi } from '../core/audio';
import { useStory } from '../core/story';
import { useAfter } from '../core/util';
import { Btn, Reveal, SceneShell, Sparkle } from '../components/ui';

const MW = 1000;
const MH = 1300;
const HOME = { x: 500, y: 600 };
const LENS = 120;

export default function Places() {
  const { visit, collect, discover, go } = useStory();
  const [view, setView] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [off, setOff] = useState({ x: HOME.x - window.innerWidth / 2, y: HOME.y - window.innerHeight / 2 });
  const [found, setFound] = useState<number[]>([]);
  const [hiddenFound, setHiddenFound] = useState<number[]>([]);
  const [msg, setMsg] = useState(false);
  const [done, setDone] = useState(false);
  const [fallback, setFallback] = useState(false);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => visit('places'), [visit]);
  useAfter(40000, () => setFallback(true));
  useEffect(() => {
    const r = () => setView({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);

  const clampOff = (x: number, y: number) => ({
    x: Math.max(-view.w * 0.3, Math.min(MW - view.w * 0.7, x)),
    y: Math.max(-view.h * 0.3, Math.min(MH - view.h * 0.6, y)),
  });

  // reveal places that pass through the lens
  useEffect(() => {
    const cx = off.x + view.w / 2;
    const cy = off.y + view.h / 2;
    PLACES.places.forEach((p, i) => {
      if (found.includes(i)) return;
      if (Math.hypot(p.x - cx, p.y - cy) < LENS) {
        const f = [...found, i];
        setFound(f);
        audio.bell(midi(67 + f.length * 2), 0.7);
        audio.chime();
        if (f.length === 4) window.setTimeout(() => setMsg(true), 1600);
      }
    });
  }, [off, view, found]);

  const tapHidden = (k: number) => {
    if (hiddenFound.includes(k)) return;
    setHiddenFound([...hiddenFound, k]);
    discover(k === 0 ? 'whale' : 'dragons', PLACES.hidden[k].text);
  };

  return (
    <SceneShell label="The Places You Haven't Discovered Yet" style={{ padding: 0 }}>
      <motion.div
        style={{ position: 'absolute', inset: 0, touchAction: 'none', cursor: 'grab', overflow: 'hidden' }}
        initial={{ clipPath: 'inset(0% 34% 0% 34%)', scaleY: 0.92 }}
        animate={{ clipPath: 'inset(0% 0% 0% 0%)', scaleY: 1 }}
        transition={{ duration: 1.8, ease: [0.65, 0, 0.25, 1], delay: 0.3 }}
        onPointerDown={(e) => {
          audio.unlock();
          drag.current = { x: e.clientX, y: e.clientY, ox: off.x, oy: off.y };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          setOff(clampOff(d.ox - (e.clientX - d.x), d.oy - (e.clientY - d.y)));
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onPointerLeave={() => (drag.current = null)}
      >
        <svg width={MW} height={MH} viewBox={`0 0 ${MW} ${MH}`} style={{ position: 'absolute', left: 0, top: 0, transform: `translate3d(${-off.x}px, ${-off.y}px, 0)` }} aria-hidden>
          <MapArt />
          {/* routes from home */}
          {PLACES.places.map((p, i) => (
            <path
              key={'r' + i}
              d={`M${HOME.x} ${HOME.y} Q${(HOME.x + p.x) / 2 + (i % 2 ? 80 : -80)} ${(HOME.y + p.y) / 2} ${p.x} ${p.y}`}
              fill="none"
              stroke="#E9CFA0"
              strokeOpacity={found.includes(i) ? 0.55 : 0.12}
              strokeDasharray="2 7"
              strokeWidth="1.6"
            />
          ))}
          {/* home */}
          <g>
            <circle cx={HOME.x} cy={HOME.y} r="34" fill="#E9CFA0" opacity=".12" />
            <Sparkle x={HOME.x} y={HOME.y} r={12} fill="#F7F0E4" />
            <text x={HOME.x} y={HOME.y + 40} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="12" letterSpacing="3" fill="#E9CFA0">
              YOU ARE HERE
            </text>
          </g>
          {PLACES.places.map((p, i) => (
            <PlaceMark key={i} p={p} found={found.includes(i)} />
          ))}
          {/* tiny hidden discoveries (tap them) */}
          <g onClick={() => tapHidden(0)} style={{ cursor: 'pointer', pointerEvents: 'all' }}>
            <Whale x={PLACES.hidden[0].x} y={PLACES.hidden[0].y} lit={hiddenFound.includes(0)} />
            <circle cx={PLACES.hidden[0].x} cy={PLACES.hidden[0].y} r="50" fill="transparent" />
          </g>
          <g onClick={() => tapHidden(1)} style={{ cursor: 'pointer', pointerEvents: 'all' }}>
            <path
              d={`M${PLACES.hidden[1].x - 30} ${PLACES.hidden[1].y} q10 -20 20 -4 q10 -18 22 -2 q8 -14 20 2 l6 -10 l2 14`}
              stroke="#D8A9B6"
              strokeOpacity={hiddenFound.includes(1) ? 0.9 : 0.35}
              fill="none"
              strokeWidth="2"
            />
            <circle cx={PLACES.hidden[1].x} cy={PLACES.hidden[1].y} r="44" fill="transparent" />
            {hiddenFound.includes(1) && (
              <text x={PLACES.hidden[1].x + 4} y={PLACES.hidden[1].y + 30} textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontStyle="italic" fontSize="16" fill="#D8A9B6">
                here be dragons
              </text>
            )}
          </g>
        </svg>
        {/* fold creases while unfolding */}
        {[1 / 3, 2 / 3].map((f) => (
          <motion.div
            key={f}
            aria-hidden
            style={{ position: 'absolute', top: 0, bottom: 0, left: `${f * 100}%`, width: 30, marginLeft: -15, background: 'linear-gradient(90deg, transparent, rgba(0,0,0,.35), rgba(255,240,220,.08), transparent)', pointerEvents: 'none' }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0.15 }}
            transition={{ delay: 1.6, duration: 2 }}
          />
        ))}
      </motion.div>

      {/* the lens */}
      <div aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', width: LENS * 2, height: LENS * 2, marginLeft: -LENS, marginTop: -LENS, borderRadius: '50%', border: '1px solid rgba(233,207,160,.55)', boxShadow: '0 0 0 2000px rgba(8,10,28,.38), inset 0 0 40px rgba(233,207,160,.15)', pointerEvents: 'none' }}>
        <svg width="100%" height="100%" viewBox="-60 -60 120 120" style={{ position: 'absolute', inset: 0 }}>
          {[0, 90, 180, 270].map((a) => (
            <line key={a} x1="0" y1="-60" x2="0" y2="-52" stroke="#E9CFA0" strokeOpacity=".7" transform={`rotate(${a})`} />
          ))}
        </svg>
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: 'calc(var(--safe-t) + var(--hud-h) + 6px) 20px 50px', background: 'linear-gradient(rgba(11,16,38,.92) 55%, transparent)', pointerEvents: 'none', display: 'flex', justifyContent: 'center' }}>
        <header className="scene-header">
          <p className="eyebrow">Door III</p>
          <h1 className="title">
            The Places <em>You Haven’t Discovered Yet</em>
          </h1>
          <p className="hint">{found.length < 4 ? `${PLACES.hint} · ${found.length}/${PLACES.places.length} found` : `${found.length}/${PLACES.places.length} places found. Keep wandering if you like.`}</p>
        </header>
      </div>

      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '70px 20px calc(var(--safe-b) + 92px)', background: 'linear-gradient(transparent, rgba(11,16,38,.94) 40%)', pointerEvents: 'none', display: 'flex', justifyContent: 'center' }}
          >
            <div className="caption">
              <Reveal lines={PLACES.message} gap={2.6} lastClass="gold italic" onDone={() => { setDone(true); collect('possibility'); }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bottom-dock">
        {(done || (fallback && !msg)) && (
          <Btn variant={done ? 'gold' : 'quiet'} onClick={() => (done ? go('world2') : setMsg(true))}>
            {done ? (
              <>
                Back to the observatory <span className="arrow">→</span>
              </>
            ) : (
              'Skip ahead softly'
            )}
          </Btn>
        )}
      </div>
    </SceneShell>
  );
}

function PlaceMark({ p, found }: { p: (typeof PLACES.places)[number]; found: boolean }) {
  return (
    <g>
      <circle cx={p.x} cy={p.y} r={found ? 46 : 22} fill="#E9CFA0" opacity={found ? 0.14 : 0.06} style={{ transition: 'all 1s' }} />
      {!found ? (
        <g opacity=".6">
          <circle cx={p.x} cy={p.y} r="16" fill="none" stroke="#A79ACD" strokeDasharray="2 3" />
          <text x={p.x} y={p.y + 6} textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="20" fill="#A79ACD">
            ?
          </text>
        </g>
      ) : (
        <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <g transform={`translate(${p.x} ${p.y})`}>
            <PlaceIcon icon={p.icon} />
          </g>
          <text x={p.x} y={p.y + 50} textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontStyle="italic" fontSize="21" fill="#F7F0E4">
            {p.name}
          </text>
          <text x={p.x} y={p.y + 72} textAnchor="middle" fontFamily="Manrope, sans-serif" fontSize="12.5" fill="#E9CFA0" opacity=".85">
            {p.note}
          </text>
        </motion.g>
      )}
    </g>
  );
}

function PlaceIcon({ icon }: { icon: string }) {
  const s = { stroke: '#E9CFA0', strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (icon) {
    case 'note':
      return <path {...s} d="M-6 12 a5 4 0 1 1 -1 -3 V-14 L12 -18 V6 a5 4 0 1 1 -1 -3 V-10 L-6 -7" />;
    case 'scope':
      return (
        <g {...s}>
          <path d="M-20 10 A20 20 0 0 1 20 10Z" fill="#E9CFA0" fillOpacity=".2" />
          <path d="M0 -10 L14 -24 M-4 10 L-10 22 M4 10 L10 22" />
        </g>
      );
    case 'peak':
      return <path {...s} d="M-24 16 L-6 -14 L2 -2 L10 -12 L26 16Z M-11 -6 L-6 -14 L-1 -6" fill="#E9CFA0" fillOpacity=".15" />;
    case 'cup':
      return (
        <g {...s}>
          <path d="M-14 -4 H12 V6 A12 10 0 0 1 -14 6Z" fill="#E9CFA0" fillOpacity=".2" />
          <path d="M12 -1 Q20 -1 18 7 Q16 11 10 10 M-6 -10 q-3 -5 0 -9 M2 -10 q-3 -5 0 -9" />
        </g>
      );
    case 'city':
      return <path {...s} d="M-24 16 V0 H-14 V-12 H-4 V4 H4 V-20 H14 V16 M14 -2 H24 V16 Z M-24 16 H24" />;
    default:
      return (
        <g {...s}>
          <circle r="16" strokeDasharray="3 4" />
          <text y="7" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="22" fill="#E9CFA0" stroke="none">
            ?
          </text>
        </g>
      );
  }
}

function Whale({ x, y, lit }: { x: number; y: number; lit: boolean }) {
  const pts: [number, number][] = [
    [-40, 0], [-24, -14], [0, -18], [24, -12], [38, 0], [30, 10], [8, 14], [-20, 10], [-40, 0], [-52, -10], [-56, 6], [-40, 0],
  ];
  return (
    <g transform={`translate(${x} ${y})`} opacity={lit ? 1 : 0.32} style={{ transition: 'opacity 1s' }}>
      <path d={'M' + pts.map((p) => p.join(' ')).join(' L')} fill="none" stroke="#A79ACD" strokeWidth="1.2" />
      {pts.slice(0, 8).map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r="2.4" fill="#F7F0E4" />
      ))}
      <circle cx="26" cy="-4" r="1.6" fill="#E9CFA0" />
      {lit && (
        <text x="0" y="40" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontStyle="italic" fontSize="16" fill="#A79ACD">
          a friendly space whale
        </text>
      )}
    </g>
  );
}

function MapArt() {
  return (
    <g>
      <defs>
        <radialGradient id="mp-bg" cx="50%" cy="45%" r="70%">
          <stop offset="0" stopColor="#262a62" />
          <stop offset="1" stopColor="#12153a" />
        </radialGradient>
      </defs>
      <rect width={MW} height={MH} fill="url(#mp-bg)" />
      {/* celestial graticule */}
      {Array.from({ length: 9 }, (_, i) => (
        <path key={'v' + i} d={`M${i * 125} 0 Q${500 + (i * 125 - 500) * 1.15} 650 ${i * 125} ${MH}`} stroke="#A79ACD" strokeOpacity=".09" fill="none" />
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <path key={'h' + i} d={`M0 ${i * 130} Q500 ${i * 130 + (i - 5) * 18} ${MW} ${i * 130}`} stroke="#A79ACD" strokeOpacity=".09" fill="none" />
      ))}
      {/* continents of the imagination */}
      <path d="M110 220 C160 150 300 160 330 230 C360 300 300 380 220 370 C140 360 70 300 110 220Z" fill="#A79ACD" opacity=".12" stroke="#A79ACD" strokeOpacity=".35" strokeDasharray="4 4" />
      <path d="M680 180 C760 130 900 170 910 260 C920 350 820 360 760 330 C690 300 620 240 680 180Z" fill="#D8A9B6" opacity=".1" stroke="#D8A9B6" strokeOpacity=".35" strokeDasharray="4 4" />
      <path d="M680 700 C760 640 900 680 900 790 C900 880 800 900 740 870 C660 830 620 760 680 700Z" fill="#E9CFA0" opacity=".08" stroke="#E9CFA0" strokeOpacity=".3" strokeDasharray="4 4" />
      <path d="M90 790 C150 740 300 770 320 860 C340 950 240 980 170 960 C90 940 40 850 90 790Z" fill="#D8A9B6" opacity=".1" stroke="#D8A9B6" strokeOpacity=".3" strokeDasharray="4 4" />
      <path d="M430 1030 C520 980 660 1020 670 1110 C680 1190 560 1220 490 1200 C410 1180 370 1080 430 1030Z" fill="#A79ACD" opacity=".12" stroke="#A79ACD" strokeOpacity=".35" strokeDasharray="4 4" />
      {/* stars scattered on the map */}
      {Array.from({ length: 120 }, (_, i) => (
        <circle key={i} cx={(i * 397) % MW} cy={(i * 739) % MH} r={(i % 3) * 0.6 + 0.6} fill="#F7F0E4" opacity={0.2 + (i % 4) * 0.12} />
      ))}
      {/* compass rose */}
      <g transform="translate(140 1080)" opacity=".6">
        <circle r="54" fill="none" stroke="#E9CFA0" strokeOpacity=".5" />
        <circle r="40" fill="none" stroke="#E9CFA0" strokeOpacity=".3" strokeDasharray="2 4" />
        <path d="M0 -60 L8 0 L0 60 L-8 0Z" fill="#E9CFA0" opacity=".7" />
        <path d="M-60 0 L0 -8 L60 0 L0 8Z" fill="#E9CFA0" opacity=".45" />
        <text y="-66" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="12" fill="#E9CFA0">N</text>
      </g>
      {/* frame */}
      <rect x="14" y="14" width={MW - 28} height={MH - 28} fill="none" stroke="#E9CFA0" strokeOpacity=".4" />
      <rect x="22" y="22" width={MW - 44} height={MH - 44} fill="none" stroke="#E9CFA0" strokeOpacity=".2" />
      <text x={MW / 2} y="60" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontStyle="italic" fontSize="26" fill="#E9CFA0" opacity=".7">
        Carta of Places Not Yet Visited
      </text>
    </g>
  );
}
