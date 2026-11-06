import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { WORLD_ONE } from '../config/content';
import { audio } from '../core/audio';
import { missionControl } from '../core/missionControl';
import { sky } from '../core/sky';
import { useStory, WORLD_ONE_STOPS, type SceneId } from '../core/story';
import { easeInOut } from '../core/util';
import { Btn, RocketArt, SceneShell, Sparkle } from '../components/ui';
import { SAX_STARS } from '../components/Keepsake';

type Stop = (typeof WORLD_ONE_STOPS)[number];

/** Destination coordinates (viewBox 0 0 390 760). Shared with the transition scene. */
export const STOP_POS: Record<Stop | 'pad', [number, number]> = {
  jazz: [112, 262],
  library: [280, 360],
  flavor: [110, 488],
  victories: [276, 606],
  pad: [195, 716],
};

let rocketAt: Stop | 'pad' = 'pad';

function splitName(name: string): [string, string] {
  const w = name.split(' ');
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < w.length; i++) {
    const d = Math.abs(w.slice(0, i).join(' ').length - w.slice(i).join(' ').length);
    if (d < diff) {
      diff = d;
      best = i;
    }
  }
  return [w.slice(0, best).join(' '), w.slice(best).join(' ')];
}

export default function WorldOne() {
  const { progress, go, update, discover } = useStory();
  const [flight, setFlight] = useState<{ from: Stop | 'pad'; to: Stop; t: number } | null>(null);
  const [moonTaps, setMoonTaps] = useState(0);
  const allVisited = WORLD_ONE_STOPS.every((s) => progress.visited[s]);
  const triggered = useRef(false);

  useEffect(() => {
    sky.setTheme('w1');
    audio.setWorld(1);
  }, []);

  useEffect(() => {
    if (!allVisited || progress.transitionDone || triggered.current) return;
    triggered.current = true;
    const a = window.setTimeout(() => missionControl.say(WORLD_ONE.allVisited), 1200);
    const b = window.setTimeout(() => go('transition'), 5200);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [allVisited, progress.transitionDone, go]);

  const fly = (to: Stop) => {
    if (flight) return;
    audio.unlock();
    audio.whoosh(1.3);
    const from = rocketAt;
    let start = 0;
    const dur = from === to ? 500 : 1250;
    const step = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / dur);
      setFlight({ from, to, t });
      if (t < 1) requestAnimationFrame(step);
      else {
        rocketAt = to;
        window.setTimeout(() => go(to as SceneId), 120);
      }
    };
    requestAnimationFrame(step);
  };

  // rocket position along a gentle arc
  let rx = STOP_POS[rocketAt][0];
  let ry = STOP_POS[rocketAt][1] - 46;
  let angle = 0;
  if (flight) {
    const [x0, y0] = STOP_POS[flight.from];
    const [x1, y1] = STOP_POS[flight.to];
    const a0 = [x0, y0 - 46];
    const a1 = [x1, y1 - 46];
    const cx = (a0[0] + a1[0]) / 2 + (a1[1] - a0[1]) * 0.35;
    const cy = (a0[1] + a1[1]) / 2 - Math.abs(a1[0] - a0[0]) * 0.35 - 30;
    const t = easeInOut(flight.t);
    rx = (1 - t) ** 2 * a0[0] + 2 * (1 - t) * t * cx + t * t * a1[0];
    ry = (1 - t) ** 2 * a0[1] + 2 * (1 - t) * t * cy + t * t * a1[1];
    const dx = 2 * (1 - t) * (cx - a0[0]) + 2 * t * (a1[0] - cx);
    const dy = 2 * (1 - t) * (cy - a0[1]) + 2 * t * (a1[1] - cy);
    angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (flight.from === flight.to) angle = 0;
  }

  const order: (Stop | 'pad')[] = ['pad', 'victories', 'flavor', 'library', 'jazz'];

  return (
    <SceneShell label="World One map">
      <header className="scene-header">
        <p className="eyebrow">{WORLD_ONE.eyebrow}</p>
        <h1 className="title">
          The Universe <em>You Haven’t Met Yet</em>
        </h1>
        <p className="hint">{allVisited ? 'All four explored. Watch the stars.' : WORLD_ONE.hint}</p>
      </header>

      <svg className="scene-fill" viewBox="0 0 390 760" preserveAspectRatio="xMidYMid meet" style={{ zIndex: 1 }}>
        <defs>
          <radialGradient id="w1-glow">
            <stop offset="0" stopColor="#E9CFA0" stopOpacity=".55" />
            <stop offset="1" stopColor="#E9CFA0" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="w1-moon" cx="35%" cy="35%">
            <stop offset="0" stopColor="#fffaf0" />
            <stop offset="1" stopColor="#d9cfe6" />
          </radialGradient>
        </defs>

        {/* route constellation */}
        {order.slice(0, -1).map((a, i) => {
          const b = order[i + 1];
          const lit = (a === 'pad' || progress.visited[a as Stop]) && progress.visited[b as Stop];
          return (
            <line
              key={a + b}
              x1={STOP_POS[a][0]}
              y1={STOP_POS[a][1]}
              x2={STOP_POS[b][0]}
              y2={STOP_POS[b][1]}
              stroke="#E9CFA0"
              strokeWidth={lit ? 1.1 : 0.8}
              strokeDasharray={lit ? undefined : '1 7'}
              strokeLinecap="round"
              opacity={lit ? 0.6 : 0.4}
            />
          );
        })}

        {/* moon: tap three times */}
        <g
          role="button"
          aria-label="The moon"
          tabIndex={0}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            const n = moonTaps + 1;
            setMoonTaps(n);
            audio.unlock();
            audio.tick(0.7 + n * 0.15);
            if (n === 3) discover('moon', WORLD_ONE.moonSecret);
          }}
        >
          <circle cx="342" cy="214" r="44" fill="url(#w1-glow)" opacity={0.25 + Math.min(3, moonTaps) * 0.15} />
          <circle cx="342" cy="214" r="17" fill="url(#w1-moon)" />
          <circle cx="350" cy="208" r="15" fill="#1b1f48" opacity={moonTaps >= 3 ? 0 : 0.92} style={{ transition: 'opacity 1.5s' }} />
          <circle cx="337" cy="219" r="2.2" fill="#cfc4df" opacity=".6" />
          <circle cx="334" cy="210" r="1.4" fill="#cfc4df" opacity=".6" />
          <circle cx="342" cy="214" r="30" fill="transparent" />
        </g>

        {/* launch pad */}
        <g opacity=".7">
          <ellipse cx={STOP_POS.pad[0]} cy={STOP_POS.pad[1] + 8} rx="30" ry="6" fill="none" stroke="#A79ACD" strokeOpacity=".5" />
          <text x="195" y="742" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8" letterSpacing="2.4" fill="#A79ACD">
            LAUNCH PAD
          </text>
        </g>

        {WORLD_ONE_STOPS.map((s, i) => {
          const [x, y] = STOP_POS[s];
          const d = WORLD_ONE.destinations[s];
          const [l1, l2] = splitName(d.name);
          const visited = !!progress.visited[s];
          return (
            <g
              key={s}
              role="button"
              tabIndex={0}
              aria-label={`${d.name}${visited ? ' (explored)' : ''}`}
              onClick={() => fly(s)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fly(s)}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={x} cy={y} r="70" fill="url(#w1-glow)" opacity={visited ? 0.5 : 0.22} />
              <g transform={`translate(${x} ${y})`}>
                <g className="float" style={{ animationDelay: `${-i * 1.7}s` }}>
                  {s === 'jazz' && <MiniJazz />}
                  {s === 'library' && <MiniLibrary />}
                  {s === 'flavor' && <MiniFlavor />}
                  {s === 'victories' && <MiniVictories lit={visited} />}
                </g>
                {visited && (
                  <g>
                    <circle r="54" fill="none" stroke="#E9CFA0" strokeOpacity=".55" strokeDasharray="2 4" className="spin-slow" />
                    <Sparkle x={38} y={-38} r={6} fill="#E9CFA0" />
                  </g>
                )}
              </g>
              <text x={x} y={y + 68} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8" letterSpacing="2.5" fill="#E9CFA0" opacity=".8">
                {d.number}
              </text>
              <text x={x} y={y + 84} textAnchor="middle" fontFamily="Cormorant Garamond, Georgia, serif" fontStyle="italic" fontSize="15.5" fill="#F7F0E4">
                {l1}
              </text>
              <text x={x} y={y + 101} textAnchor="middle" fontFamily="Cormorant Garamond, Georgia, serif" fontStyle="italic" fontSize="15.5" fill="#F7F0E4">
                {l2}
              </text>
              <rect x={x - 70} y={y - 60} width="140" height="170" fill="transparent" />
            </g>
          );
        })}

        <g transform={`translate(${rx} ${ry}) rotate(${angle})`} style={{ pointerEvents: 'none' }}>
          <RocketArt flame={flight ? 1.3 : 0.25} id="w1-rk" />
        </g>
      </svg>

      {allVisited && progress.transitionDone && (
        <div className="bottom-dock">
          <Btn variant="gold" onClick={() => go('world2')}>
            Through the doorway <span className="arrow">→</span>
          </Btn>
        </div>
      )}
    </SceneShell>
  );
}

function MiniJazz() {
  return (
    <g>
      <defs>
        <linearGradient id="mj-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8f86c4" />
          <stop offset="1" stopColor="#4c4790" />
        </linearGradient>
        <linearGradient id="mj-rock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3570" />
          <stop offset="1" stopColor="#171B3F" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M-44 8 Q-30 46 -4 52 Q6 40 18 44 Q36 30 44 8 Z" fill="url(#mj-rock)" />
      <ellipse cx="0" cy="8" rx="44" ry="11" fill="url(#mj-top)" />
      {[-30, -18, -6, 10, 24, 34].map((x, i) => (
        <g key={i}>
          <path d={`M${x} 6 Q${x + 2} ${-6 - (i % 3) * 6} ${x - 1} ${-14 - (i % 3) * 7}`} stroke="#8fb3a2" strokeWidth="1" fill="none" />
          <circle cx={x - 1} cy={-14 - (i % 3) * 7} r="3.6" fill={['#D8A9B6', '#E9CFA0', '#A79ACD'][i % 3]} />
          <circle cx={x - 1} cy={-14 - (i % 3) * 7} r="1.3" fill="#fffaf0" />
        </g>
      ))}
      <path d="M-8 -30 Q0 -34 3 -26 L3 -6 Q3 6 11 4 Q17 2 17 -9" stroke="#E9CFA0" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <ellipse cx="17" cy="-10" rx="4" ry="1.6" fill="#E9CFA0" />
    </g>
  );
}

function MiniLibrary() {
  const cols = ['#A79ACD', '#D8A9B6', '#E9CFA0', '#7f86c9', '#c98f86', '#A79ACD', '#E9CFA0'];
  return (
    <g>
      <path d="M-30 30 L-30 -14 Q-30 -40 0 -44 Q30 -40 30 -14 L30 30 Z" fill="#232860" stroke="#E9CFA0" strokeWidth="1.2" strokeOpacity=".7" />
      <path d="M-24 30 L-24 -12 Q-24 -34 0 -37 Q24 -34 24 -12 L24 30Z" fill="#141838" />
      {[-12, 6, 24].map((y) => (
        <line key={y} x1="-24" x2="24" y1={y} y2={y} stroke="#E9CFA0" strokeOpacity=".45" strokeWidth="1" />
      ))}
      {cols.map((c, i) => (
        <rect key={i} x={-22 + i * 6.3} y={-8 - (i % 3) * 2} width="5" height={20 - 12 + 12 - (i % 3) * 2} rx="0.8" fill={c} opacity=".9" />
      ))}
      {cols.slice(0, 6).map((c, i) => (
        <rect key={'b' + i} x={-22 + i * 7.3} y={12 - (i % 2) * 3} width="6" height={12 + (i % 2) * 3} rx="0.8" fill={c} opacity=".75" />
      ))}
      <ellipse cx="0" cy="34" rx="38" ry="6" fill="#A79ACD" opacity=".25" />
      <g transform="translate(34 -30) rotate(18)">
        <rect x="-7" y="-5" width="14" height="10" rx="1" fill="#D8A9B6" />
        <line x1="0" y1="-5" x2="0" y2="5" stroke="#fffaf0" strokeWidth=".8" />
      </g>
      <g transform="translate(-38 -18) rotate(-22)">
        <rect x="-6" y="-4" width="12" height="8" rx="1" fill="#E9CFA0" />
      </g>
    </g>
  );
}

function MiniFlavor() {
  return (
    <g>
      <defs>
        <radialGradient id="mf-p" cx="35%" cy="30%">
          <stop offset="0" stopColor="#f2cbd3" />
          <stop offset=".6" stopColor="#b47f9c" />
          <stop offset="1" stopColor="#5c4a86" />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy="0" rx="50" ry="11" fill="none" stroke="#E9CFA0" strokeOpacity=".5" strokeWidth="1.4" transform="rotate(-14)" />
      <circle r="32" fill="url(#mf-p)" />
      <circle cx="-10" cy="8" r="5" fill="#8a5f86" opacity=".45" />
      <circle cx="12" cy="-10" r="3.5" fill="#8a5f86" opacity=".4" />
      <circle cx="10" cy="14" r="2.5" fill="#8a5f86" opacity=".4" />
      <path d="M-50 4 A50 11 0 0 0 50 -4" fill="none" stroke="#E9CFA0" strokeOpacity=".75" strokeWidth="1.4" transform="rotate(-14)" />
      <path d="M0 -32 Q-2 -42 4 -46" stroke="#8fb3a2" strokeWidth="1.4" fill="none" />
      <ellipse cx="9" cy="-46" rx="6" ry="3" fill="#8fb3a2" transform="rotate(-20 9 -46)" />
      <circle cx="-4" cy="-38" r="4.5" fill="#E9CFA0" />
    </g>
  );
}

function MiniVictories({ lit }: { lit: boolean }) {
  return (
    <g>
      <circle r="38" fill="#0e1230" stroke="#A79ACD" strokeOpacity=".5" />
      <circle r="31" fill="none" stroke="#A79ACD" strokeOpacity=".2" strokeDasharray="1 3" />
      <g transform="translate(-33 -36) scale(.3)">
        {SAX_STARS.slice(0, -1).map(([x, y], i) => (
          <line key={i} x1={x} y1={y} x2={SAX_STARS[i + 1][0]} y2={SAX_STARS[i + 1][1]} stroke="#E9CFA0" strokeWidth="3" opacity={lit ? 0.9 : 0.25} />
        ))}
        {SAX_STARS.map(([x, y], i) => (
          <Sparkle key={i} x={x} y={y} r={lit ? 14 : 10} fill="#F7F0E4" />
        ))}
      </g>
    </g>
  );
}
