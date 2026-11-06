import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { HOODIE, PERSONAL } from '../config/content';
import { audio, midi } from '../core/audio';
import { sky } from '../core/sky';
import { useStory } from '../core/story';
import { Btn, Reveal, SceneShell, Sparkle } from '../components/ui';
import { SAX_STARS } from '../components/Keepsake';

type Step = 'box' | 'opening' | 'hoodie' | 'hood';

export default function Hoodie() {
  const { go } = useStory();
  const [step, setStep] = useState<Step>('box');
  const [canFinish, setCanFinish] = useState(false);

  useEffect(() => {
    sky.setTheme('gold');
  }, []);

  const open = () => {
    if (step !== 'box') return;
    audio.unlock();
    audio.page();
    audio.whoosh(1.4);
    setStep('opening');
    [69, 74, 78, 81].forEach((m, i) => audio.bell(midi(m), 0.5, 0.5 + i * 0.12));
    window.setTimeout(() => setStep('hoodie'), 1900);
  };
  const lookInside = () => {
    if (step !== 'hoodie') return;
    audio.swell();
    setStep('hood');
    window.setTimeout(() => setCanFinish(true), 6500);
  };

  const zoom = step === 'hood';

  return (
    <SceneShell label="One last discovery">
      <header className="scene-header" style={{ minHeight: 96 }}>
        <AnimatePresence mode="wait">
          {(step === 'box' || step === 'opening') && (
            <motion.div key="a" exit={{ opacity: 0 }}>
              <p className="eyebrow">The final secret</p>
              <Reveal lines={[HOODIE.gift]} className="lede italic" />
            </motion.div>
          )}
          {step === 'hoodie' && (
            <motion.div key="b" exit={{ opacity: 0 }}>
              <Reveal lines={[HOODIE.upClose]} delay={0.6} className="lede italic" />
            </motion.div>
          )}
          {step === 'hood' && (
            <motion.div key="c">
              <p className="eyebrow">Inside the hood</p>
              <Reveal lines={[`“${PERSONAL.hoodieMessage}”`]} delay={2.6} className="lede italic gold" />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div style={{ flex: 1, width: '100%', display: 'grid', placeItems: 'center', minHeight: 0, zIndex: 2, overflow: 'visible' }}>
        <svg viewBox="0 0 300 360" style={{ width: 'min(86vw, 400px)', maxHeight: '100%', overflow: 'hidden', borderRadius: zoom ? 24 : 0 }} aria-hidden>
          <defs>
            <radialGradient id="hd-glow">
              <stop offset="0" stopColor="#fff2d6" stopOpacity=".9" />
              <stop offset=".4" stopColor="#E9CFA0" stopOpacity=".3" />
              <stop offset="1" stopColor="#E9CFA0" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="hd-body" x1="0" x2="1">
              <stop offset="0" stopColor={PERSONAL.hoodieShade} />
              <stop offset=".45" stopColor={PERSONAL.hoodieColor} />
              <stop offset="1" stopColor={PERSONAL.hoodieShade} />
            </linearGradient>
            <radialGradient id="hd-lining" cx="50%" cy="80%">
              <stop offset="0" stopColor={PERSONAL.hoodieLining} stopOpacity=".55" />
              <stop offset="1" stopColor={PERSONAL.hoodieLining} />
            </radialGradient>
            <linearGradient id="hd-box" x1="0" x2="1">
              <stop offset="0" stopColor="#e9dcc4" />
              <stop offset=".5" stopColor="#fbf5ea" />
              <stop offset="1" stopColor="#dccdb2" />
            </linearGradient>
            <path id="hd-thread" d="M121 104 C 120 60, 180 60, 179 104" />
          </defs>

          <g
            style={{
              transform: zoom ? 'translate(-255px, -58px) scale(2.7)' : 'translate(0px, 0px) scale(1)',
              transformOrigin: '0 0',
              transformBox: 'view-box',
              transition: 'transform 2.6s cubic-bezier(.65,0,.25,1)',
            }}
          >
            {/* light from the box */}
            <motion.circle cx="150" cy="200" r="150" fill="url(#hd-glow)" initial={{ opacity: 0.2 }} animate={{ opacity: step === 'box' ? 0.25 : 0.7 }} transition={{ duration: 1.5 }} />

            {/* the hoodie */}
            <motion.g
              initial={{ y: 120, opacity: 0, scale: 0.4 }}
              animate={step === 'box' ? { y: 120, opacity: 0, scale: 0.4 } : { y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 1.8, delay: step === 'opening' ? 0.5 : 0, ease: [0.22, 0.8, 0.2, 1] }}
              style={{ transformOrigin: '150px 300px' }}
              onClick={lookInside}
              role="button"
              aria-label="Look inside the hood"
            >
              {/* hood back */}
              <path d="M96 112 C88 40 212 40 204 112 Z" fill="url(#hd-body)" />
              {/* sleeves */}
              <path d="M98 108 L62 128 C48 170 40 230 38 292 L66 296 C70 240 80 190 96 160Z" fill="url(#hd-body)" />
              <path d="M202 108 L238 128 C252 170 260 230 262 292 L234 296 C230 240 220 190 204 160Z" fill="url(#hd-body)" />
              <rect x="36" y="288" width="32" height="14" rx="4" fill={PERSONAL.hoodieShade} transform="rotate(2 52 295)" />
              <rect x="232" y="288" width="32" height="14" rx="4" fill={PERSONAL.hoodieShade} transform="rotate(-2 248 295)" />
              {/* body */}
              <path d="M98 106 C120 116 180 116 202 106 L210 310 L90 310 Z" fill="url(#hd-body)" />
              <rect x="88" y="300" width="124" height="20" rx="4" fill={PERSONAL.hoodieShade} />
              {Array.from({ length: 20 }, (_, i) => (
                <line key={i} x1={92 + i * 6} y1="302" x2={92 + i * 6} y2="318" stroke="#000" strokeOpacity=".15" />
              ))}
              {/* pocket */}
              <path d="M112 236 L188 236 L200 286 L100 286 Z" fill="#000" opacity=".12" />
              <path d="M112 236 L188 236 L200 286 L100 286 Z" fill="none" stroke="#000" strokeOpacity=".2" />
              {/* hood opening + lining */}
              <path d="M112 112 C108 56 192 56 188 112 C174 124 126 124 112 112Z" fill="url(#hd-lining)" />
              <path d="M112 112 C108 56 192 56 188 112" fill="none" stroke={PERSONAL.hoodieShade} strokeWidth="3" />
              {/* hidden message, stitched in gold thread */}
              <text fontFamily="Caveat, cursive" fontSize="8.4" fill="#E9CFA0" letterSpacing=".2">
                <textPath href="#hd-thread" startOffset="50%" textAnchor="middle">
                  {PERSONAL.hoodieMessage.split('').map((ch, i) => (
                    <motion.tspan key={i} initial={{ opacity: 0 }} animate={{ opacity: zoom ? 1 : 0 }} transition={{ delay: zoom ? 2.2 + i * 0.07 : 0, duration: 0.4 }}>
                      {ch}
                    </motion.tspan>
                  ))}
                </textPath>
              </text>
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: zoom ? 1 : 0.0 }} transition={{ delay: 4.6, duration: 1.2 }}>
                <Sparkle x={132} y={98} r={2.2} fill="#E9CFA0" />
                <Sparkle x={168} y={98} r={2.2} fill="#E9CFA0" />
                <path d="M146 100 q2 -3 4 0 q2 3 4 0" stroke="#E9CFA0" strokeWidth=".6" fill="none" />
              </motion.g>
              {/* drawstrings */}
              <path d="M136 120 L132 170 M164 120 L168 170" stroke="#E9CFA0" strokeOpacity=".8" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="132" cy="172" r="2.4" fill="#E9CFA0" />
              <circle cx="168" cy="172" r="2.4" fill="#E9CFA0" />
              {/* tiny embroidered constellation on the chest */}
              <g transform="translate(166 138) scale(.14)" opacity=".85">
                {SAX_STARS.slice(0, -1).map(([x, y], i) => (
                  <line key={i} x1={x} y1={y} x2={SAX_STARS[i + 1][0]} y2={SAX_STARS[i + 1][1]} stroke="#E9CFA0" strokeWidth="6" />
                ))}
                {SAX_STARS.map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="10" fill="#F7F0E4" />
                ))}
              </g>
              <rect x="90" y="40" width="120" height="100" fill="transparent" />
            </motion.g>

            {/* the gift box */}
            <motion.g animate={step === 'box' ? { y: 0, opacity: 1 } : { y: 90, opacity: 0 }} transition={{ duration: 1.4, delay: step === 'opening' ? 0.6 : 0 }} onClick={open} role="button" aria-label="Open the gift" style={{ cursor: 'pointer' }}>
              <g className={step === 'box' ? 'float' : undefined}>
                <rect x="96" y="236" width="108" height="78" rx="4" fill="url(#hd-box)" />
                <rect x="143" y="236" width="14" height="78" fill="#E9CFA0" />
                <motion.g animate={step === 'box' ? { y: 0, rotate: 0 } : { y: -70, rotate: -18, opacity: 0 }} transition={{ duration: 1.1 }} style={{ transformOrigin: '150px 230px' }}>
                  <rect x="90" y="220" width="120" height="20" rx="3" fill="url(#hd-box)" />
                  <rect x="143" y="220" width="14" height="20" fill="#E9CFA0" />
                  <path d="M150 220 C130 196 112 206 124 218 C130 224 144 222 150 220 C156 222 170 224 176 218 C188 206 170 196 150 220Z" fill="#E9CFA0" stroke="#c9a66b" />
                  <circle cx="150" cy="219" r="4" fill="#c9a66b" />
                </motion.g>
                <rect x="70" y="200" width="160" height="130" fill="transparent" />
              </g>
            </motion.g>
          </g>
        </svg>
      </div>

      <div className="bottom-dock">
        {step === 'box' && (
          <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 2 }}>
            tap the gift to open it
          </motion.p>
        )}
        {step === 'hoodie' && (
          <Btn onClick={lookInside} delay={2.2}>
            {HOODIE.lookInside}
          </Btn>
        )}
        {canFinish && (
          <Btn variant="gold" onClick={() => go('finale')}>
            Complete the mission <span className="arrow">→</span>
          </Btn>
        )}
      </div>
    </SceneShell>
  );
}
