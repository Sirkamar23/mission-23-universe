import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { missionControl } from './missionControl';
import { audio } from './audio';
import { QUIPS } from '../config/content';

export type SceneId =
  | 'opening'
  | 'world1'
  | 'jazz'
  | 'library'
  | 'flavor'
  | 'victories'
  | 'transition'
  | 'world2'
  | 'music'
  | 'workshop'
  | 'places'
  | 'becoming'
  | 'constellation'
  | 'planet23'
  | 'hoodie'
  | 'finale';

export type Fragment = 'curiosity' | 'creativity' | 'courage' | 'passion' | 'persistence' | 'possibility';
export const FRAGMENTS: Fragment[] = ['curiosity', 'creativity', 'courage', 'passion', 'persistence', 'possibility'];

export const WORLD_ONE_STOPS = ['jazz', 'library', 'flavor', 'victories'] as const;
export const WORLD_TWO_DOORS = ['music', 'workshop', 'places', 'becoming'] as const;

/** Secret discoveries that reward curiosity (never required). */
export const SECRETS = ['moon', 'sax', 'encore', 'marginalia', 'poke', 'whale', 'dragons', 'improviser', 'telescope'] as const;
export type Secret = (typeof SECRETS)[number];

export type Progress = {
  started: boolean;
  scene: SceneId;
  visited: Partial<Record<SceneId, boolean>>;
  fragments: Fragment[];
  secrets: string[];
  transitionDone: boolean;
  finished: boolean;
};

const KEY = 'mission23.progress.v1';
const fresh = (): Progress => ({
  started: false,
  scene: 'world1',
  visited: {},
  fragments: [],
  secrets: [],
  transitionDone: false,
  finished: false,
});

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    return { ...fresh(), ...JSON.parse(raw) };
  } catch {
    return fresh();
  }
}

/** Scenes that should not be resumed into directly. */
const RESUME_MAP: Partial<Record<SceneId, SceneId>> = {
  opening: 'world1',
  transition: 'world1',
  constellation: 'world2',
};

type Ctx = {
  scene: SceneId;
  progress: Progress;
  /** Where the visitor left off last time (for the “resume” option). */
  resumeScene: SceneId;
  go: (s: SceneId) => void;
  visit: (s: SceneId) => void;
  collect: (f: Fragment) => void;
  discover: (s: Secret, message?: string) => void;
  update: (p: Partial<Progress>) => void;
  restart: () => void;
};

const StoryContext = createContext<Ctx | null>(null);

export function StoryProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(load);
  const [scene, setScene] = useState<SceneId>(() => {
    // dev-only shortcut for testing: ?scene=jazz
    if (import.meta.env.DEV) {
      const q = new URLSearchParams(location.search).get('scene');
      if (q) return q as SceneId;
    }
    return 'opening';
  });
  const [resumeScene] = useState<SceneId>(() => {
    const p = load();
    return RESUME_MAP[p.scene] ?? p.scene;
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress));
    } catch {
      /* private mode: progress just won't persist */
    }
  }, [progress]);

  const go = useCallback((s: SceneId) => {
    setScene(s);
    if (s !== 'opening') setProgress((p) => ({ ...p, started: true, scene: s }));
  }, []);

  const visit = useCallback((s: SceneId) => {
    setProgress((p) => (p.visited[s] ? p : { ...p, visited: { ...p.visited, [s]: true } }));
  }, []);

  const ref = useRef(progress);
  ref.current = progress;

  const collect = useCallback((f: Fragment) => {
    const p = ref.current;
    if (p.fragments.includes(f)) return;
    const next = { ...p, fragments: [...p.fragments, f] };
    ref.current = next;
    setProgress((q) => (q.fragments.includes(f) ? q : { ...q, fragments: [...q.fragments, f] }));
    audio.chime();
    if (p.fragments.length === 0) missionControl.say([QUIPS.fragment]);
    window.dispatchEvent(new CustomEvent('m23:fragment', { detail: f }));
  }, []);

  const discover = useCallback((s: Secret, message?: string) => {
    const p = ref.current;
    if (p.secrets.includes(s)) return;
    const next = { ...p, secrets: [...p.secrets, s] };
    ref.current = next;
    setProgress((q) => (q.secrets.includes(s) ? q : { ...q, secrets: [...q.secrets, s] }));
    audio.chime();
    missionControl.say([...(message ? [message] : []), `✦ Secret discovery logged (${next.secrets.length}/${SECRETS.length})`], {
      secret: true,
    });
  }, []);

  const update = useCallback((patch: Partial<Progress>) => setProgress((p) => ({ ...p, ...patch })), []);

  const restart = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setProgress(fresh());
    missionControl.clear();
    setScene('opening');
  }, []);

  const value = useMemo(
    () => ({ scene, progress, resumeScene, go, visit, collect, discover, update, restart }),
    [scene, progress, resumeScene, go, visit, collect, discover, update, restart],
  );
  return <StoryContext.Provider value={value}>{children}</StoryContext.Provider>;
}

export function useStory() {
  const c = useContext(StoryContext);
  if (!c) throw new Error('useStory outside StoryProvider');
  return c;
}
