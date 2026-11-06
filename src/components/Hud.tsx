import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { audio } from '../core/audio';
import { FRAGMENTS, useStory, type SceneId } from '../core/story';
import { missionControl, useMissionControl } from '../core/missionControl';
import { Typewriter } from './ui';
import { Keepsake } from './Keepsake';

const BACK: Partial<Record<SceneId, { to: SceneId; label: string }>> = {
  jazz: { to: 'world1', label: 'Map' },
  library: { to: 'world1', label: 'Map' },
  flavor: { to: 'world1', label: 'Map' },
  victories: { to: 'world1', label: 'Map' },
  music: { to: 'world2', label: 'Observatory' },
  workshop: { to: 'world2', label: 'Observatory' },
  places: { to: 'world2', label: 'Observatory' },
  becoming: { to: 'world2', label: 'Observatory' },
};

function useMuted() {
  return useSyncExternalStore(
    (f) => audio.subscribe(f),
    () => audio.muted,
    () => audio.muted,
  );
}

export function Hud() {
  const { scene, go, progress, restart } = useStory();
  const muted = useMuted();
  const [menu, setMenu] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [keepsake, setKeepsake] = useState(false);
  const back = BACK[scene];
  const hidden = scene === 'opening';
  const fragRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <AnimatePresence>
        {!hidden && (
          <motion.nav
            className="hud"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            aria-label="Mission controls"
          >
            <div>
              {back ? (
                <button className="hud-back" onClick={() => go(back.to)} aria-label={`Back to ${back.label}`}>
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                    <path d="M11 4 L6 9 L11 14" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                  </svg>
                  {back.label}
                </button>
              ) : (
                <span className="hud-back" aria-hidden style={{ opacity: 0.55 }}>
                  M·23
                </span>
              )}
            </div>
            <div className="hud-right">
              <div className="fragments" ref={fragRef} id="fragment-dock" aria-label={`${progress.fragments.length} of 6 golden fragments`}>
                {FRAGMENTS.map((f) => (
                  <i key={f} className={progress.fragments.includes(f) ? 'on' : ''} />
                ))}
              </div>
              <button
                className="hud-btn"
                onClick={() => {
                  audio.unlock();
                  audio.setMuted(!muted);
                }}
                aria-label={muted ? 'Unmute sound' : 'Mute sound'}
                aria-pressed={muted}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                  <path d="M3 8 H6 L10 4.5 V15.5 L6 12 H3 Z" fill="currentColor" fillOpacity=".15" />
                  {muted ? (
                    <path d="M13 7.5 L17 12.5 M17 7.5 L13 12.5" />
                  ) : (
                    <>
                      <path d="M13 7.4 Q14.6 10 13 12.6" />
                      <path d="M15.2 5.6 Q18.2 10 15.2 14.4" opacity=".7" />
                    </>
                  )}
                </svg>
              </button>
              <button className="hud-btn" onClick={() => setMenu(true)} aria-label="Open menu">
                <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden fill="currentColor">
                  <circle cx="4.5" cy="10" r="1.4" />
                  <circle cx="10" cy="10" r="1.4" />
                  <circle cx="15.5" cy="10" r="1.4" />
                </svg>
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menu && (
          <motion.div
            className="sheet-veil"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setMenu(false);
              setConfirm(false);
            }}
          >
            <motion.div
              className="sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={{ y: 60 }}
              animate={{ y: 0 }}
              exit={{ y: 60 }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
            >
              {!confirm ? (
                <>
                  <h2>Mission Log</h2>
                  <p>
                    {progress.fragments.length} of 6 golden fragments · {progress.secrets.length} secret discoveries
                  </p>
                  {progress.visited.world1 || progress.started ? (
                    <button className="btn" onClick={() => { setMenu(false); go('world1'); }}>
                      World One map
                    </button>
                  ) : null}
                  {progress.transitionDone && (
                    <button className="btn" onClick={() => { setMenu(false); go('world2'); }}>
                      The Observatory (World Two)
                    </button>
                  )}
                  {progress.visited.victories && (
                    <button className="btn" onClick={() => { setMenu(false); setKeepsake(true); }}>
                      Keepsake: Saxophonus Minor
                    </button>
                  )}
                  <button className="btn quiet" onClick={() => setConfirm(true)}>
                    Restart the mission
                  </button>
                  <button className="btn quiet" onClick={() => setMenu(false)}>
                    Close
                  </button>
                </>
              ) : (
                <>
                  <h2>Begin again?</h2>
                  <p>This erases progress and starts from the very first star.</p>
                  <button
                    className="btn gold"
                    onClick={() => {
                      setMenu(false);
                      setConfirm(false);
                      restart();
                    }}
                  >
                    Yes, from the first star
                  </button>
                  <button className="btn quiet" onClick={() => setConfirm(false)}>
                    Keep exploring
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>{keepsake && <Keepsake onClose={() => setKeepsake(false)} />}</AnimatePresence>
      <FragmentFlight />
    </>
  );
}

/** A golden shard flies from the middle of the screen to the dock when a fragment is collected. */
function FragmentFlight() {
  const [flights, setFlights] = useState<{ id: number; x: number; y: number }[]>([]);
  useEffect(() => {
    const on = () => {
      const dock = document.getElementById('fragment-dock');
      const r = dock?.getBoundingClientRect();
      const x = r ? r.left + r.width / 2 - window.innerWidth / 2 : window.innerWidth / 2 - 60;
      const y = r ? r.top + r.height / 2 - window.innerHeight / 2 : -window.innerHeight / 2 + 30;
      const id = Date.now();
      setFlights((f) => [...f, { id, x, y }]);
      window.setTimeout(() => setFlights((f) => f.filter((q) => q.id !== id)), 2600);
    };
    window.addEventListener('m23:fragment', on);
    return () => window.removeEventListener('m23:fragment', on);
  }, []);
  return (
    <>
      {flights.map((f) => (
        <motion.div
          key={f.id}
          aria-hidden
          style={{ position: 'fixed', left: '50%', top: '50%', zIndex: 50, pointerEvents: 'none', marginLeft: -14, marginTop: -14 }}
          initial={{ x: 0, y: 40, scale: 0.2, opacity: 0, rotate: 0 }}
          animate={{
            x: [0, 0, f.x * 0.4, f.x],
            y: [40, 0, f.y * 0.5 - 40, f.y],
            scale: [0.2, 1.4, 0.9, 0.3],
            opacity: [0, 1, 1, 0],
            rotate: [0, 90, 180, 270],
          }}
          transition={{ duration: 2.4, times: [0, 0.3, 0.7, 1], ease: 'easeInOut' }}
        >
          <svg width="28" height="28" viewBox="-14 -14 28 28">
            <circle r="12" fill="#E9CFA0" opacity=".25" />
            <path d="M0 -10 L4 0 L0 10 L-4 0Z" fill="#F7F0E4" />
            <path d="M0 -10 L4 0 L0 0Z" fill="#E9CFA0" />
          </svg>
        </motion.div>
      ))}
    </>
  );
}

/** Mission Control: dry remarks in a little console at the top. Tap to dismiss. */
export function MissionControl() {
  const q = useMissionControl();
  const cur = q[0];
  const [typed, setTyped] = useState(false);
  useEffect(() => {
    setTyped(false);
  }, [cur?.id]);
  useEffect(() => {
    if (!typed || !cur) return;
    const id = window.setTimeout(() => missionControl.next(), 2600 + (cur.secret ? 1800 : 0));
    return () => window.clearTimeout(id);
  }, [typed, cur]);
  return (
    <div className="mc" aria-live="polite">
      <AnimatePresence mode="wait">
        {cur && (
          <motion.div
            key={cur.id}
            className={'mc-panel' + (cur.secret ? ' secret' : '')}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.35 } }}
            transition={{ duration: 0.45 }}
            onClick={() => missionControl.next()}
            role="status"
          >
            <div className="mc-label">Mission Control</div>
            <Typewriter lines={cur.lines} speed={22} pause={380} onDone={() => setTyped(true)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
