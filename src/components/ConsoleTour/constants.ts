/**
 * Color references for use in dynamic inline styles.
 * Actual hex values live in index.css @theme — this just maps to those CSS variables
 * so inline styles stay in sync with Tailwind utilities automatically.
 */
export const C = {
  void:         'var(--color-void)',
  deepSpace:    'var(--color-deep-space)',
  deepTeal:     'var(--color-deep-teal)',
  mutedPurple:  'var(--color-muted-purple)',
  warmGray:     'var(--color-warm-gray)',
  silver:       'var(--color-silver)',
  matrixGreen:  'var(--color-matrix-green)',
  mintGlow:     'var(--color-mint-glow)',
  cyan:         'var(--color-cyan)',
  amber:        'var(--color-amber)',
  nearWhite:    'var(--color-near-white)',
} as const

export const TIMING = {
  /** ms per character for typewriter reveal (boot phase only) */
  typewriterMs:   30,
  /** total boot phase duration in ms */
  bootDurationMs: 5200,
  /** ms between lines for post-boot content stagger */
  lineStaggerMs:  80,
  /** ms before pulsing [▸] for first-time nudge */
  nudgeDelayMs:   3000,

  // Open animation — "signal acquisition"
  openFlash:      100,   // scale overshoot + fade in
  openScan:       280,   // scanline glitch + horizontal jitter

  // Close animation — "CRT power-off"
  closeCompress:  240,   // squish vertically, brightness spike
  closeLine:      200,   // hold as glowing horizontal line
  closeDot:       300,   // collapse width to zero, afterglow fades
} as const

export const SIZES = {
  /** Terminal sizing now lives in Tailwind classes on ConsoleTour.tsx */
  /** Mobile breakpoint below which console is hidden */
  mobileBreakpoint: 640,
} as const
