import { useEffect, useRef, useState } from 'react';

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Deterministic pseudo-random generator (so illustrations look the same every visit). */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Elapsed seconds since `active` became true, updated every animation frame. */
export function useClock(active = true, speed = 1) {
  const [t, setT] = useState(0);
  const start = useRef<number | null>(null);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    start.current = null;
    const loop = (now: number) => {
      if (start.current === null) start.current = now;
      setT(((now - start.current) / 1000) * speed);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, speed]);
  return t;
}

/** setTimeout that is cleared automatically on unmount. */
export function useTimeouts() {
  const ids = useRef<number[]>([]);
  useEffect(
    () => () => {
      ids.current.forEach((i) => window.clearTimeout(i));
    },
    [],
  );
  return (fn: () => void, ms: number) => {
    ids.current.push(window.setTimeout(fn, ms));
  };
}

/** Run once after `ms` (cleared on unmount). */
export function useAfter(ms: number, fn: () => void, deps: unknown[] = []) {
  useEffect(() => {
    const id = window.setTimeout(fn, ms);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Pointer position relative to an element, in that element's SVG viewBox units. */
export function svgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const m = svg.getScreenCTM();
  if (!m) return { x: 0, y: 0 };
  const p = pt.matrixTransform(m.inverse());
  return { x: p.x, y: p.y };
}

/** Capture the pointer on the element if possible (never throws). */
export function capture(e: { currentTarget: EventTarget | null; target: EventTarget | null; pointerId: number }) {
  try {
    const el = (e.currentTarget || e.target) as Element | null;
    el?.setPointerCapture?.(e.pointerId);
  } catch {
    /* ignore */
  }
}
