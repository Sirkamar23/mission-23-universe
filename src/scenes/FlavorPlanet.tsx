import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { FLAVOR } from '../config/content';
import { audio, midi } from '../core/audio';
import { missionControl } from '../core/missionControl';
import { useStory } from '../core/story';
import { useAfter, capture } from '../core/util';
import { Btn, Reveal, SceneShell, Sparkle } from '../components/ui';

const R = 62; // fruit radius in viewBox units

export default function FlavorPlanet() {
  const { visit, collect, discover, go } = useStory();
  const [fi, setFi] = useState(0);
  const [angle, setAngle] = useState(0);
  const [scanned, setScanned] = useState<boolean[]>([false, false, false]);
  const [choice, setChoice] = useState<number | null>(null);
  const [bitten, setBitten] = useState<boolean[]>([false, false, false]);
  const [message, setMessage] = useState(false);
  const [done, setDone] = useState(false);
  const [fallback, setFallback] = useState(false);
  const travel = useRef(0);
  const drag = useRef<{ x: number; moved: number; last: number; v: number } | null>(null);
  const pokes = useRef(0);
  const announced = useRef(false);
  const fruit = FLAVOR.fruits[fi];

  useEffect(() => visit('flavor'), [visit]);
  useAfter(30000, () => setFallback(true));

  useEffect(() => {
    const id = window.setTimeout(() => missionControl.say([FLAVOR.scanning[0]]), 900);
    return () => window.clearTimeout(id);
  }, []);

  const rotate = (d: number) => {
    setAngle((a) => a + d);
    travel.current += Math.abs(d);
    if (travel.current > 300 && !scanned[fi]) {
      setScanned((s) => s.map((v, j) => (j === fi ? true : v)));
      audio.chime();
      if (!announced.current) {
        announced.current = true;
        missionControl.say(FLAVOR.scanning.slice(1));
      }
    }
  };

  // inertia after release
  const spin = (v: number) => {
    let vel = v;
    const step = () => {
      if (drag.current || Math.abs(vel) < 0.2) return;
      rotate(vel);
      vel *= 0.93;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const poke = () => {
    pokes.current++;
    audio.tick(0.6 + Math.random() * 0.3);
    if (pokes.current % 3 === 0) {
      const k = pokes.current / 3 - 1;
      if (k < FLAVOR.pokes.length) {
        if (k === FLAVOR.pokes.length - 1) discover('poke', FLAVOR.pokes[k]);
        else missionControl.say([FLAVOR.pokes[k]]);
      }
    }
  };

  const choose = (k: number) => {
    setChoice(k);
    audio.bell(midi(69 + k * 3), 0.6);
    if (k === 0) {
      audio.page();
      setBitten((b) => b.map((v, j) => (j === fi ? true : v)));
    }
    missionControl.say([FLAVOR.choices[k].reply]);
    if (!message) window.setTimeout(() => setMessage(true), 2600);
  };

  const nextFruit = () => {
    setFi((fi + 1) % FLAVOR.fruits.length);
    travel.current = 0;
    setChoice(null);
    audio.whoosh(0.6);
  };

  const shift = (((angle % 360) + 360) % 360) / 360; // 0..1
  const stemX = Math.sin((angle * Math.PI) / 180) * R * 0.55;
  const stemFront = Math.cos((angle * Math.PI) / 180) > -0.2;

  return (
    <SceneShell label="The Planet of Unknown Flavors">
      <header className="scene-header">
        <p className="eyebrow">Destination 03</p>
        <h1 className="title">
          The Planet of <em>Unknown Flavors</em>
        </h1>
        <p className="hint">{scanned[fi] ? `Specimen: ${fruit.name}` : FLAVOR.hint}</p>
      </header>

      <svg className="scene-fill" viewBox="0 0 390 700" preserveAspectRatio="xMidYMax meet" style={{ zIndex: 1 }}>
        <defs>
          <radialGradient id="fl-ground" cx="50%" cy="0%" r="90%">
            <stop offset="0" stopColor="#b98aa6" />
            <stop offset=".35" stopColor="#6d5596" />
            <stop offset="1" stopColor="#262356" />
          </radialGradient>
          <radialGradient id="fl-shade" cx="36%" cy="30%" r="75%">
            <stop offset="0" stopColor="#fff" stopOpacity=".55" />
            <stop offset=".35" stopColor="#fff" stopOpacity="0" />
            <stop offset=".8" stopColor="#0b1026" stopOpacity=".25" />
            <stop offset="1" stopColor="#0b1026" stopOpacity=".6" />
          </radialGradient>
          <radialGradient id="fl-beam" cx="50%" cy="100%" r="80%">
            <stop offset="0" stopColor="#E9CFA0" stopOpacity=".45" />
            <stop offset="1" stopColor="#E9CFA0" stopOpacity="0" />
          </radialGradient>
          <clipPath id="fl-clip">
            <circle cx="195" cy="330" r={R} />
          </clipPath>
          <mask id="fl-bite">
            <rect x="0" y="0" width="390" height="700" fill="#fff" />
            {bitten[fi] && (
              <g fill="#000">
                <circle cx={195 + R * 0.78} cy={330 - R * 0.6} r="15" />
                <circle cx={195 + R * 0.95} cy={330 - R * 0.3} r="13" />
                <circle cx={195 + R * 0.55} cy={330 - R * 0.85} r="12" />
              </g>
            )}
          </mask>
        </defs>

        {/* other moons */}
        <circle cx="62" cy="210" r="16" fill="#E9CFA0" opacity=".25" />
        <circle cx="66" cy="206" r="16" fill="#171B3F" opacity=".6" />
        <circle cx="336" cy="250" r="7" fill="#D8A9B6" opacity=".5" />

        {/* planet surface */}
        <path d="M-80 560 Q195 470 470 560 L470 760 L-80 760Z" fill="url(#fl-ground)" />
        <path d="M-80 560 Q195 470 470 560" fill="none" stroke="#f2cbd3" strokeOpacity=".5" />
        {/* whimsical flora */}
        <g opacity=".95">
          <path d="M40 560 C30 520 60 500 48 470 C40 450 60 440 66 456" stroke="#9fc6b4" strokeWidth="3" fill="none" />
          <circle cx="66" cy="456" r="9" fill="#D8A9B6" />
          <circle cx="63" cy="453" r="3" fill="#fff4e6" />
          <path d="M84 548 q-4 -30 8 -44" stroke="#9fc6b4" strokeWidth="2" fill="none" />
          <ellipse cx="94" cy="500" rx="10" ry="16" fill="#A79ACD" />
          <path d="M94 486 L94 514 M86 494 L102 494" stroke="#ece6ff" strokeOpacity=".5" />
          <path d="M318 540 C330 500 300 480 316 450" stroke="#9fc6b4" strokeWidth="3" fill="none" />
          <path d="M316 450 q-12 -14 0 -26 q12 12 0 26" fill="#E9CFA0" />
          <path d="M346 552 q8 -40 -6 -60 q-8 -12 6 -16 q14 4 4 18" stroke="#9fc6b4" strokeWidth="2" fill="none" />
          <circle cx="352" cy="474" r="5" fill="#f2c6b8" />
          {[130, 170, 230, 270].map((x, i) => (
            <circle key={x} cx={x} cy={528 - (i % 2) * 6} r={2 + (i % 3)} fill="#f2cbd3" opacity=".6" />
          ))}
        </g>

        {/* pedestal + scanning beam */}
        <path d="M150 520 L240 520 L216 438 L174 438Z" fill="url(#fl-beam)" />
        <ellipse cx="195" cy="520" rx="46" ry="9" fill="#2b2860" stroke="#E9CFA0" strokeOpacity=".6" />
        <ellipse cx="195" cy="436" rx="30" ry="6" fill="none" stroke="#E9CFA0" strokeOpacity=".55" strokeDasharray="3 4" className="dash-run" />

        {/* the specimen */}
        <g
          className="float"
          role="img"
          aria-label={`${fruit.name}. Drag to rotate.`}
          onPointerDown={(e) => {
            capture(e);
            audio.unlock();
            drag.current = { x: e.clientX, moved: 0, last: performance.now(), v: 0 };
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            const dx = e.clientX - d.x;
            d.x = e.clientX;
            d.moved += Math.abs(dx);
            d.v = dx * 1.1;
            rotate(dx * 1.1);
          }}
          onPointerUp={() => {
            const d = drag.current;
            drag.current = null;
            if (!d) return;
            if (d.moved < 6) poke();
            else spin(d.v);
          }}
          onPointerCancel={() => (drag.current = null)}
          style={{ cursor: 'grab', touchAction: 'none' }}
        >
          <circle cx="195" cy="330" r={R + 40} fill="transparent" />
          <circle cx="195" cy="330" r={R + 22} fill={fruit.accent} opacity=".14" />
          {!stemFront && <Stem x={195 + stemX} color={fruit.accent} />}
          <g mask="url(#fl-bite)">
            <circle cx="195" cy="330" r={R} fill={fruit.body} />
            <g clipPath="url(#fl-clip)">
              <g transform={`translate(${-shift * R * 4} 0)`}>
                {[0, 1, 2].map((rep) => (
                  <g key={rep} transform={`translate(${rep * R * 4} 0)`}>
                    <Pattern kind={fi} accent={fruit.accent} />
                  </g>
                ))}
              </g>
            </g>
            <circle cx="195" cy="330" r={R} fill="url(#fl-shade)" />
            {bitten[fi] && (
              <g fill="#fff6e0" opacity=".85">
                <circle cx={195 + R * 0.62} cy={330 - R * 0.5} r="4" />
                <circle cx={195 + R * 0.76} cy={330 - R * 0.22} r="3" />
              </g>
            )}
          </g>
          {stemFront && <Stem x={195 + stemX} color={fruit.accent} />}
          {scanned[fi] && <Sparkle x={258} y={262} r={7} className="twinkle" />}
        </g>

        <text x="195" y="560" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8.5" letterSpacing="2.4" fill="#E9CFA0" opacity=".85">
          SPECIMEN {fi + 1}/3 · {Math.round(Math.min(100, (travel.current / 300) * 100))}% SCANNED
        </text>
      </svg>

      {/* ingredients */}
      <AnimatePresence>
        {scanned[fi] && !message && (
          <motion.div
            key={fi}
            className="mc-panel"
            style={{ position: 'absolute', zIndex: 6, bottom: 'calc(var(--safe-b) + 136px)', left: 20, right: 20, maxWidth: 360, margin: '0 auto' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="mc-label">Imaginary ingredients · {fruit.name}</div>
            {fruit.ingredients.map((x) => (
              <div key={x}>— {x}</div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="caption" style={{ marginTop: 'auto', marginBottom: 90 }}>
        {message && (
          <Reveal
            lines={FLAVOR.message}
            gap={2.6}
            lastClass="gold italic"
            onDone={() => {
              setDone(true);
              collect('courage');
            }}
          />
        )}
      </div>

      <div className="bottom-dock" style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
        {scanned[fi] && !message && choice === null &&
          FLAVOR.choices.map((c, k) => (
            <Btn key={c.label} onClick={() => choose(k)} delay={0.3 + k * 0.15} style={{ padding: '0 16px', fontSize: 13 }}>
              {c.label}
            </Btn>
          ))}
        {(choice !== null || message) && !done && !message && (
          <Btn variant="quiet" onClick={nextFruit}>
            Inspect another specimen
          </Btn>
        )}
        {done && (
          <>
            <Btn variant="quiet" onClick={nextFruit}>
              Another specimen
            </Btn>
            <Btn variant="gold" onClick={() => go('world1')} delay={0.4}>
              Continue <span className="arrow">→</span>
            </Btn>
          </>
        )}
        {!scanned[fi] && fallback && !done && (
          <Btn variant="quiet" onClick={() => setMessage(true)}>
            Skip ahead softly
          </Btn>
        )}
      </div>
    </SceneShell>
  );
}

function Stem({ x, color }: { x: number; color: string }) {
  return (
    <g>
      <path d={`M${x} ${330 - R + 4} q -2 -14 6 -22`} stroke="#6f9a86" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d={`M${x + 5} ${330 - R - 16} q 18 -14 30 -2 q -14 12 -30 2Z`} fill="#9fc6b4" />
      <circle cx={x - 8} cy={330 - R - 8} r="4" fill={color} opacity=".9" />
    </g>
  );
}

/** Surface pattern, R*4 wide, repeated to fake a rotating sphere. */
function Pattern({ kind, accent }: { kind: number; accent: string }) {
  const W = R * 4;
  const x0 = 195 - R;
  const els = [];
  if (kind === 0) {
    for (let i = 0; i < 9; i++)
      els.push(<circle key={i} cx={x0 + (i * W) / 9} cy={330 + Math.sin(i * 1.7) * R * 0.6} r={6 + (i % 3) * 4} fill={accent} opacity=".6" />);
    els.push(<path key="w" d={`M${x0} 330 q ${W / 8} -14 ${W / 4} 0 t ${W / 4} 0 t ${W / 4} 0 t ${W / 4} 0`} stroke="#fff4ec" strokeOpacity=".45" strokeWidth="3" fill="none" />);
  } else if (kind === 1) {
    for (let i = 0; i < 8; i++)
      els.push(<path key={i} d={`M${x0 + (i * W) / 8} ${330 - R} q 14 ${R} 0 ${R * 2}`} stroke={accent} strokeWidth="4" fill="none" opacity=".55" />);
    for (let i = 0; i < 6; i++) els.push(<circle key={'d' + i} cx={x0 + (i * W) / 6 + 16} cy={330 + ((i % 2) - 0.5) * 50} r="3" fill="#fffaf0" opacity=".7" />);
  } else {
    for (let i = 0; i < 14; i++)
      els.push(<circle key={i} cx={x0 + (i * W) / 14} cy={330 + Math.cos(i * 2.3) * R * 0.7} r={4 + (i % 4) * 2} fill={accent} opacity=".7" />);
    for (let i = 0; i < 10; i++) els.push(<circle key={'s' + i} cx={x0 + (i * W) / 10 + 8} cy={330 + Math.sin(i * 1.3) * R * 0.5} r="1.6" fill="#fff" opacity=".8" />);
  }
  return <g>{els}</g>;
}
