import { motion } from 'motion/react';
import { VICTORIES } from '../config/content';
import { Sparkle } from './ui';

/** “Saxophonus Minor”: the constellation of small victories (viewBox 0 0 200 260). */
export const SAX_STARS: [number, number][] = [
  [46, 34],
  [80, 20],
  [110, 48],
  [112, 100],
  [114, 156],
  [126, 218],
  [164, 212],
  [174, 160],
];

export function SaxConstellation({ lit = SAX_STARS.length - 1, glow = true }: { lit?: number; glow?: boolean }) {
  return (
    <g>
      {SAX_STARS.slice(0, -1).map(([x, y], i) => {
        const [x2, y2] = SAX_STARS[i + 1];
        return (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={x2}
            y2={y2}
            stroke="#E9CFA0"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity={i < lit ? 0.85 : 0.12}
            strokeDasharray={i < lit ? undefined : '2 5'}
          />
        );
      })}
      {SAX_STARS.map(([x, y], i) => (
        <g key={i}>
          {glow && <circle cx={x} cy={y} r="14" fill="url(#ks-glow)" opacity={i <= lit ? 0.9 : 0.25} />}
          <Sparkle x={x} y={y} r={i <= lit ? 7 : 4} fill={i <= lit ? '#F7F0E4' : '#A79ACD'} />
        </g>
      ))}
    </g>
  );
}

export function Keepsake({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="sheet-veil"
      style={{ alignItems: 'center' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Keepsake constellation"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', padding: 24, maxWidth: 380 }}
      >
        <p className="eyebrow">Keepsake</p>
        <svg viewBox="0 0 200 260" width="220" style={{ maxWidth: '62vw' }} aria-hidden>
          <defs>
            <radialGradient id="ks-glow">
              <stop offset="0" stopColor="#E9CFA0" stopOpacity=".8" />
              <stop offset="1" stopColor="#E9CFA0" stopOpacity="0" />
            </radialGradient>
          </defs>
          <SaxConstellation />
        </svg>
        <h2 className="title" style={{ fontStyle: 'italic', marginTop: 6 }}>
          {VICTORIES.constellationName}
        </h2>
        <p className="hint" style={{ fontFamily: 'var(--serif)', fontSize: 17, fontStyle: 'italic' }}>
          {VICTORIES.constellationNote}
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', color: 'var(--mist)', fontSize: 13, lineHeight: 1.7 }}>
          {VICTORIES.reminders.map((r) => (
            <li key={r}>✦ {r}</li>
          ))}
        </ul>
        <p className="hint" style={{ marginTop: 18 }}>tap anywhere to close</p>
      </motion.div>
    </motion.div>
  );
}
