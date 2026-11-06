import { motion } from 'motion/react';
import { useEffect, useState, type ReactNode } from 'react';
import { WORLD_TWO } from '../config/content';
import { audio } from '../core/audio';
import { missionControl } from '../core/missionControl';
import { sky } from '../core/sky';
import { useStory, WORLD_TWO_DOORS, type SceneId } from '../core/story';
import { Btn, SceneShell, Sparkle } from '../components/ui';

type Door = (typeof WORLD_TWO_DOORS)[number];

const DOOR_STYLE: Record<Door, { from: string; to: string }> = {
  music: { from: '#2a2470', to: '#130f3a' },
  workshop: { from: '#7b5068', to: '#2e2148' },
  places: { from: '#5a5d9e', to: '#1d2052' },
  becoming: { from: '#e9cfa0', to: '#8a6f9c' },
};

let firstArrival = true;

export default function WorldTwo() {
  const { progress, go, discover } = useStory();
  const [opening, setOpening] = useState<Door | null>(null);
  const [flash] = useState(firstArrival);
  const all = WORLD_TWO_DOORS.every((d) => progress.visited[d]);

  useEffect(() => {
    firstArrival = false;
    sky.setTheme('w2');
    audio.setWorld(2);
  }, []);

  useEffect(() => {
    if (!all) return;
    const id = window.setTimeout(() => missionControl.say([WORLD_TWO.allOpen]), 1400);
    return () => window.clearTimeout(id);
  }, [all]);

  const enter = (d: Door) => {
    if (opening) return;
    audio.unlock();
    audio.whoosh(1);
    audio.tick(0.8);
    setOpening(d);
    window.setTimeout(() => go(d as SceneId), 950);
  };

  return (
    <SceneShell label="The Observatory">
      {flash && (
        <motion.div
          aria-hidden
          style={{ position: 'absolute', inset: 0, zIndex: 30, pointerEvents: 'none', background: 'radial-gradient(60% 50% at 50% 48%, #fffaf0, #f3dcc0 50%, #c9a9c9)' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2.6, ease: 'easeOut' }}
        />
      )}

      <ObservatoryArt glow={all} />

      <header className="scene-header">
        <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: flash ? 1.4 : 0.2 }}>
          {WORLD_TWO.eyebrow}
        </motion.p>
        <motion.h1 className="title" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: flash ? 1.8 : 0.3, duration: 1.4 }}>
          The Future That <em>Hasn’t Happened Yet</em>
        </motion.h1>
        <p className="hint">{all ? WORLD_TWO.allOpen : WORLD_TWO.hint}</p>
      </header>

      <div
        style={{
          position: 'relative',
          zIndex: 3,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'min(2vh, 16px) min(5vw, 28px)',
          width: 'min(100%, 380px)',
          marginTop: 'min(2.2vh, 22px)',
        }}
      >
        {WORLD_TWO_DOORS.map((d, i) => (
          <DoorButton key={d} d={d} i={i} visited={!!progress.visited[d]} opening={opening === d} onOpen={() => enter(d)} delay={flash ? 2.2 + i * 0.18 : 0.2 + i * 0.12} />
        ))}
      </div>

      {/* the telescope */}
      <div style={{ marginTop: 'auto', position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {all ? (
          <Btn variant="gold" onClick={() => go('constellation')} delay={0.6}>
            Look through the telescope <span className="arrow">→</span>
          </Btn>
        ) : (
          <button
            aria-label="The telescope"
            onClick={() => {
              audio.unlock();
              discover('telescope', WORLD_TWO.telescope);
            }}
            style={{ width: 110, height: 76, display: 'grid', placeItems: 'center' }}
          >
            <Telescope glow={false} />
          </button>
        )}
      </div>
    </SceneShell>
  );
}

function DoorButton({ d, i, visited, opening, onOpen, delay }: { d: Door; i: number; visited: boolean; opening: boolean; onOpen: () => void; delay: number }) {
  const st = DOOR_STYLE[d];
  const id = 'dr' + i;
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={WORLD_TWO.doors[d].name + (visited ? ' (opened)' : '')}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 1 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
    >
      <div style={{ position: 'relative', width: 'min(100%, calc(18.5vh * 0.78))', aspectRatio: '100 / 128', perspective: 600 }}>
        <svg viewBox="0 0 100 128" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden>
          <defs>
            <linearGradient id={id + 'in'} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={st.from} />
              <stop offset="1" stopColor={st.to} />
            </linearGradient>
            <clipPath id={id + 'c'}>
              <path d="M12 126 L12 46 Q12 8 50 4 Q88 8 88 46 L88 126Z" />
            </clipPath>
          </defs>
          <path d="M6 128 L6 44 Q6 0 50 -2 Q94 0 94 44 L94 128" fill="none" stroke="#E9CFA0" strokeOpacity=".55" strokeWidth="1.2" />
          <path d="M12 126 L12 46 Q12 8 50 4 Q88 8 88 46 L88 126Z" fill={`url(#${id}in)`} />
          <g clipPath={`url(#${id}c)`}>
            <DoorScene d={d} />
          </g>
          <Sparkle x={50} y={-8} r={visited ? 6 : 4} fill={visited ? '#E9CFA0' : '#cfc6ea'} />
        </svg>
        {/* the door leaf */}
        <motion.div
          style={{
            position: 'absolute',
            left: '12%',
            right: '12%',
            top: '3%',
            bottom: '1.5%',
            borderRadius: '50% 50% 0 0 / 30% 30% 0 0',
            background: 'linear-gradient(180deg, #2b2a5e, #1a1b45)',
            border: '1px solid rgba(233,207,160,.45)',
            transformOrigin: '0% 50%',
            boxShadow: 'inset 0 0 0 6px rgba(233,207,160,.06)',
            display: 'grid',
            placeItems: 'center',
          }}
          initial={false}
          animate={{ rotateY: opening ? -110 : visited ? -38 : 0, opacity: opening ? 0.4 : 1 }}
          transition={{ duration: opening ? 0.9 : 1.2, ease: [0.5, 0, 0.2, 1] }}
        >
          <svg width="34" height="34" viewBox="-17 -17 34 34" aria-hidden>
            <circle r="14" fill="none" stroke="#E9CFA0" strokeOpacity=".5" />
            <DoorGlyph d={d} />
          </svg>
          <span style={{ position: 'absolute', right: '10%', top: '56%', width: 5, height: 5, borderRadius: '50%', background: '#E9CFA0' }} />
        </motion.div>
      </div>
      <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(13.5px,3.7vw,16.5px)', lineHeight: 1.15, textAlign: 'center', color: 'var(--ivory)', minHeight: '2.3em' }}>
        {WORLD_TWO.doors[d].name}
      </span>
    </motion.button>
  );
}

function DoorGlyph({ d }: { d: Door }): ReactNode {
  const s = { stroke: '#E9CFA0', strokeWidth: 1.3, fill: 'none', strokeLinecap: 'round' as const };
  if (d === 'music') return <path {...s} d="M-3 6 a3 2.4 0 1 1 -1 -2 V-8 L6 -10 V3 a3 2.4 0 1 1 -1 -2 V-6 L-3 -4.6" />;
  if (d === 'workshop') return <g {...s}><circle r="5" /><path d="M0 -10 V-6 M0 6 V10 M-10 0 H-6 M6 0 H10 M-7 -7 L-4.5 -4.5 M7 7 L4.5 4.5 M7 -7 L4.5 -4.5 M-7 7 L-4.5 4.5" /></g>;
  if (d === 'places') return <g {...s}><path d="M0 -10 L3 0 L0 10 L-3 0Z" fill="#E9CFA0" fillOpacity=".4" /><path d="M-10 0 L0 -3 L10 0 L0 3Z" /></g>;
  return <g {...s}><circle r="3" fill="#E9CFA0" /><path d="M-9 6 Q0 -2 9 6" /><path d="M0 -10 V-7" /></g>;
}

function DoorScene({ d }: { d: Door }) {
  if (d === 'music')
    return (
      <g>
        <path d="M20 128 L50 40 L80 128Z" fill="#E9CFA0" opacity=".12" />
        <path d="M46 70 q4 -6 6 0 l0 30 q4 10 12 2 l2 -12" stroke="#E9CFA0" strokeWidth="3" fill="none" />
        <ellipse cx="50" cy="120" rx="34" ry="6" fill="#E9CFA0" opacity=".25" />
      </g>
    );
  if (d === 'workshop')
    return (
      <g stroke="#f3dfe6" strokeOpacity=".5" fill="none">
        <circle cx="50" cy="72" r="16" strokeDasharray="2 3" />
        <circle cx="50" cy="72" r="4" />
        <path d="M30 108 H70 M36 108 V124 M64 108 V124" />
      </g>
    );
  if (d === 'places')
    return (
      <g>
        <path d="M18 90 q20 -24 34 -6 t32 -14" stroke="#E9CFA0" strokeDasharray="2 4" fill="none" opacity=".7" />
        <path d="M24 60 q14 -10 22 2 q-6 12 -22 -2Z" fill="#A79ACD" opacity=".5" />
        <path d="M60 100 q14 -8 22 4 q-10 10 -22 -4Z" fill="#D8A9B6" opacity=".5" />
      </g>
    );
  return (
    <g>
      <circle cx="50" cy="66" r="18" fill="#fff6e0" opacity=".6" />
      <path d="M12 110 H88" stroke="#2b2445" strokeOpacity=".5" />
      <path d="M44 110 v-10 a3 3 0 0 1 6 0 v10" fill="#2b2445" opacity=".6" />
    </g>
  );
}

function Telescope({ glow }: { glow: boolean }) {
  return (
    <svg width="100" height="76" viewBox="0 0 120 92" aria-hidden>
      <defs>
        <radialGradient id="ts-g">
          <stop offset="0" stopColor="#E9CFA0" stopOpacity=".8" />
          <stop offset="1" stopColor="#E9CFA0" stopOpacity="0" />
        </radialGradient>
      </defs>
      {glow && <circle cx="86" cy="20" r="30" fill="url(#ts-g)" className="pulse" style={{ transformOrigin: '86px 20px' }} />}
      <g transform="rotate(-32 60 50)">
        <rect x="28" y="40" width="64" height="15" rx="4" fill="#E9CFA0" />
        <rect x="88" y="37" width="12" height="21" rx="3" fill="#c9a66b" />
        <rect x="16" y="43" width="14" height="9" rx="2" fill="#c9a66b" />
        <rect x="44" y="40" width="3" height="15" fill="#9b7240" />
      </g>
      <path d="M58 56 L44 88 M58 56 L72 88 M58 56 L58 88" stroke="#c9a66b" strokeWidth="2" />
      <circle cx="58" cy="56" r="4" fill="#9b7240" />
    </svg>
  );
}

function ObservatoryArt({ glow }: { glow: boolean }) {
  return (
    <svg className="scene-fill" viewBox="0 0 390 760" preserveAspectRatio="xMidYMid slice" aria-hidden style={{ zIndex: 0 }}>
      <defs>
        <linearGradient id="ob-cloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d8b8cb" stopOpacity=".55" />
          <stop offset="1" stopColor="#6d5a95" stopOpacity=".2" />
        </linearGradient>
        <radialGradient id="ob-floor" cx="50%" cy="50%">
          <stop offset="0" stopColor="#E9CFA0" stopOpacity={glow ? 0.35 : 0.18} />
          <stop offset="1" stopColor="#E9CFA0" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* dome ribs */}
      {[-120, -70, -30, 0, 30, 70, 120].map((a) => (
        <path key={a} d={`M195 -40 Q${195 + a * 1.4} 60 ${195 + a * 2.2} 200`} stroke="#E9CFA0" strokeOpacity=".09" fill="none" />
      ))}
      <path d="M-20 200 Q195 120 410 200" stroke="#E9CFA0" strokeOpacity=".16" fill="none" />
      {/* columns */}
      {[18, 372].map((x) => (
        <g key={x} opacity=".5">
          <rect x={x - 9} y="200" width="18" height="460" fill="#1d1d4c" />
          <rect x={x - 13} y="196" width="26" height="8" fill="#2b2a62" />
          <line x1={x - 3} y1="210" x2={x - 3} y2="650" stroke="#E9CFA0" strokeOpacity=".15" />
        </g>
      ))}
      {/* circular floor inlay */}
      <ellipse cx="195" cy="660" rx="200" ry="44" fill="url(#ob-floor)" />
      <ellipse cx="195" cy="660" rx="150" ry="30" fill="none" stroke="#E9CFA0" strokeOpacity=".22" />
      <ellipse cx="195" cy="660" rx="96" ry="18" fill="none" stroke="#E9CFA0" strokeOpacity=".16" strokeDasharray="2 5" />
      {/* clouds beyond the balustrade */}
      <g style={{ animation: 'ob-drift 30s ease-in-out infinite alternate' }}>
        <path d="M-60 720 q40 -40 90 -18 q30 -36 80 -10 q40 -30 90 0 q50 -26 90 8 q40 -10 70 20 L420 800 L-60 800Z" fill="url(#ob-cloud)" />
      </g>
      <g style={{ animation: 'ob-drift 40s ease-in-out infinite alternate-reverse' }} opacity=".7">
        <path d="M-60 750 q50 -30 100 -6 q40 -30 90 -4 q50 -24 100 6 q50 -18 110 10 L420 800 L-60 800Z" fill="#c9a9c9" opacity=".25" />
      </g>
      <style>{`@keyframes ob-drift{from{transform:translateX(-20px)}to{transform:translateX(20px)}}`}</style>
    </svg>
  );
}
