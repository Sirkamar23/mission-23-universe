import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { FINALE } from '../config/content';
import { sky } from '../core/sky';
import { SECRETS, useStory } from '../core/story';
import { Btn, SceneShell, Sparkle, Typewriter } from '../components/ui';
import { Keepsake } from '../components/Keepsake';

export default function Finale() {
  const { progress, go, restart } = useStory();
  const [logged, setLogged] = useState(false);
  const [keepsake, setKeepsake] = useState(false);

  useEffect(() => {
    sky.setTheme('w2');
  }, []);

  const lines = [
    ...FINALE.log.slice(0, 2),
    `Golden fragments: ${progress.fragments.length}/6.`,
    `Secret discoveries: ${progress.secrets.length}/${SECRETS.length}.`,
    ...FINALE.log.slice(2),
  ];

  return (
    <SceneShell label="Mission complete">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, width: '100%', zIndex: 2 }}>
        <motion.svg width="120" height="120" viewBox="-60 -60 120 120" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2 }} aria-hidden>
          <defs>
            <radialGradient id="fn-g">
              <stop offset="0" stopColor="#E9CFA0" stopOpacity=".7" />
              <stop offset="1" stopColor="#E9CFA0" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle r="56" fill="url(#fn-g)" className="pulse" />
          <Sparkle r={22} fill="#F7F0E4" />
        </motion.svg>

        <motion.h1
          className="title"
          style={{ textAlign: 'center', fontStyle: 'italic', fontSize: 'clamp(30px, 8.6vw, 46px)' }}
          initial={{ opacity: 0, y: 12, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.8, duration: 2 }}
        >
          {FINALE.title}
        </motion.h1>

        <motion.div className="mc-panel" style={{ width: 'min(100%, 340px)', minHeight: 140 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }}>
          <div className="mc-label">Final mission log</div>
          <Typewriter lines={lines} startDelay={3000} speed={30} onDone={() => setLogged(true)} />
        </motion.div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 3, minHeight: 150 }}>
        {logged && (
          <>
            <Btn variant="gold" onClick={() => go('world1')} delay={0.4}>
              Revisit the universe
            </Btn>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Btn variant="quiet" onClick={() => setKeepsake(true)} delay={0.8}>
                Keepsake constellation
              </Btn>
              <Btn variant="quiet" onClick={restart} delay={1}>
                Begin again from the first star
              </Btn>
            </div>
          </>
        )}
      </div>
      <AnimatePresence>{keepsake && <Keepsake onClose={() => setKeepsake(false)} />}</AnimatePresence>
    </SceneShell>
  );
}
