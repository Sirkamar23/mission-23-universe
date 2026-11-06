import { motion } from 'motion/react';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { prefersReducedMotion } from '../core/util';
import { audio } from '../core/audio';

/** Every scene lives in one of these: a soft cinematic cross-fade in and out. */
export function SceneShell({
  children,
  label,
  className = '',
  style,
}: {
  children: ReactNode;
  label: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.main
      className={'scene ' + className}
      aria-label={label}
      style={style}
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.8, ease: [0.4, 0, 0.6, 1] } }}
      transition={{ duration: 1.2, ease: [0.22, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.main>
  );
}

/** Lines that arrive one after another, like thoughts. */
export function Reveal({
  lines,
  delay = 0,
  gap = 1.7,
  className = 'lede glow-text',
  lastClass,
  onDone,
}: {
  lines: string[];
  delay?: number;
  gap?: number;
  className?: string;
  lastClass?: string;
  onDone?: () => void;
}) {
  useEffect(() => {
    if (!onDone) return;
    const id = window.setTimeout(onDone, (delay + gap * (lines.length - 1) + 1.4) * 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      {lines.map((l, i) => (
        <motion.p
          key={i + l}
          className={i === lines.length - 1 && lastClass ? className + ' ' + lastClass : className}
          initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: delay + i * gap, duration: 1.3, ease: [0.22, 0.8, 0.2, 1] }}
        >
          {l}
        </motion.p>
      ))}
    </>
  );
}

/** Typed mono text for Mission Control consoles. */
export function Typewriter({
  lines,
  speed = 32,
  pause = 520,
  onDone,
  startDelay = 0,
}: {
  lines: string[];
  speed?: number;
  pause?: number;
  onDone?: () => void;
  startDelay?: number;
}) {
  const reduce = prefersReducedMotion();
  const [li, setLi] = useState(reduce ? lines.length : 0);
  const [ci, setCi] = useState(0);
  const [started, setStarted] = useState(startDelay === 0);
  useEffect(() => {
    if (started) return;
    const id = window.setTimeout(() => setStarted(true), startDelay);
    return () => window.clearTimeout(id);
  }, [started, startDelay]);
  useEffect(() => {
    if (!started) return;
    if (li >= lines.length) {
      onDone?.();
      return;
    }
    const line = lines[li];
    if (ci < line.length) {
      const id = window.setTimeout(() => {
        setCi(ci + 1);
        if (ci % 3 === 0) audio.tick(0.9 + Math.random() * 0.2);
      }, speed);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => {
      setLi(li + 1);
      setCi(0);
    }, pause);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [li, ci, started]);
  return (
    <div aria-live="polite">
      {lines.map((l, i) =>
        i < li ? (
          <div key={i}>{l}</div>
        ) : i === li ? (
          <div key={i}>
            {l.slice(0, ci)}
            <span className="caret" />
          </div>
        ) : null,
      )}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  variant = 'ghost',
  delay = 0,
  label,
  style,
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: 'ghost' | 'gold' | 'quiet';
  delay?: number;
  label?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.button
      type="button"
      className={'btn ' + (variant === 'ghost' ? '' : variant)}
      aria-label={label}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.9, ease: [0.22, 0.8, 0.2, 1] }}
      onClick={() => {
        audio.tick();
        onClick();
      }}
    >
      {children}
    </motion.button>
  );
}

/** Four-pointed sparkle used everywhere as this universe's “star”. */
export function Sparkle({ x = 0, y = 0, r = 6, fill = '#E9CFA0', opacity = 1, className }: {
  x?: number;
  y?: number;
  r?: number;
  fill?: string;
  opacity?: number;
  className?: string;
}) {
  const k = r * 0.18;
  return (
    <path
      className={className}
      d={`M${x} ${y - r} C${x + k} ${y - k} ${x + k} ${y - k} ${x + r} ${y} C${x + k} ${y + k} ${x + k} ${y + k} ${x} ${y + r} C${x - k} ${y + k} ${x - k} ${y + k} ${x - r} ${y} C${x - k} ${y - k} ${x - k} ${y - k} ${x} ${y - r}Z`}
      fill={fill}
      opacity={opacity}
    />
  );
}

/** Soft radial glow. Needs a gradient id from <GlowDefs/>. */
export function GlowDefs({ id = 'glow', color = '#E9CFA0' }: { id?: string; color?: string }) {
  return (
    <radialGradient id={id}>
      <stop offset="0" stopColor={color} stopOpacity="0.9" />
      <stop offset="0.35" stopColor={color} stopOpacity="0.28" />
      <stop offset="1" stopColor={color} stopOpacity="0" />
    </radialGradient>
  );
}

/** The ship. Points up; origin at its centre. */
export function RocketArt({ flame = 1, id = 'rk' }: { flame?: number; id?: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={id + 'b'} x1="0" x2="1">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="0.55" stopColor="#F7F0E4" />
          <stop offset="1" stopColor="#cdbfd9" />
        </linearGradient>
        <linearGradient id={id + 'f'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6e0" />
          <stop offset="0.4" stopColor="#E9CFA0" />
          <stop offset="1" stopColor="#D8A9B6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {flame > 0 && (
        <path
          d={`M-5 14 Q0 ${14 + 26 * flame} 5 14 Z`}
          fill={`url(#${id}f)`}
          style={{ transformOrigin: '0 14px', animation: 'flicker .12s infinite alternate' }}
        />
      )}
      <path d="M-6 6 L-13 17 L-13 20 L-5 15 Z" fill="#E9CFA0" />
      <path d="M6 6 L13 17 L13 20 L5 15 Z" fill="#c9a66b" />
      <path d="M0 -22 C9 -12 9 4 6 15 L-6 15 C-9 4 -9 -12 0 -22Z" fill={`url(#${id}b)`} />
      <path d="M0 -22 C4 -18 6 -14 6.6 -10 L-6.6 -10 C-6 -14 -4 -18 0 -22Z" fill="#D8A9B6" />
      <circle cx="0" cy="-1" r="3.6" fill="#171B3F" stroke="#E9CFA0" strokeWidth="1.3" />
      <circle cx="-1" cy="-2.2" r="1" fill="#A79ACD" />
      <path d="M-1.5 15 L1.5 15 L0 21Z" fill="#E9CFA0" />
      <style>{`@keyframes flicker{from{transform:scaleY(.82)}to{transform:scaleY(1.12)}}`}</style>
    </g>
  );
}
