import { useSyncExternalStore } from 'react';

/** Global sky state shared by the canvas starfield and scenes. */
export type SkyTheme = 'void' | 'w1' | 'w2' | 'gold';

type SkyState = { theme: SkyTheme; warp: number };
let state: SkyState = { theme: 'void', warp: 0 };
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const sky = {
  get: () => state,
  setTheme(theme: SkyTheme) {
    if (state.theme === theme) return;
    state = { ...state, theme };
    emit();
  },
  /** Positive = flying forward (stars stream outward). Negative = pulling back. 0 = calm. */
  warp(warp: number) {
    state = { ...state, warp };
    emit();
  },
  subscribe(f: () => void) {
    subs.add(f);
    return () => {
      subs.delete(f);
    };
  },
};

export function useSky() {
  return useSyncExternalStore(sky.subscribe, sky.get, sky.get);
}
