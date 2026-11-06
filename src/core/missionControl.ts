import { useSyncExternalStore } from 'react';

export type McMessage = { id: number; lines: string[]; secret?: boolean };

let queue: McMessage[] = [];
let seq = 1;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

/** Mission Control: the dry, slightly smug narrator in the corner. */
export const missionControl = {
  say(lines: string[], opts: { secret?: boolean } = {}) {
    queue = [...queue, { id: seq++, lines, secret: opts.secret }];
    emit();
  },
  next() {
    queue = queue.slice(1);
    emit();
  },
  clear() {
    queue = [];
    emit();
  },
  subscribe(f: () => void) {
    subs.add(f);
    return () => {
      subs.delete(f);
    };
  },
  get() {
    return queue;
  },
};

export function useMissionControl() {
  return useSyncExternalStore(missionControl.subscribe, missionControl.get, missionControl.get);
}
