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

/** Global timing defaults — used across all phases. */
export const TIMING = {
  /** ms per character for typewriter reveal */
  typewriterMs:   30,
  /** default ms to wait after a line finishes before the next starts (per-line pauseAfterMs overrides) */
  linePauseMs:    100,
  /** ms before pulsing Continue ▸ for first-time nudge */
  nudgeDelayMs:   3000,
} as const

/**
 * Progress bar weighting.
 * totalSegments = bootWeight + onboardingSteps + visibleTourSteps
 */
export const PROGRESS = {
  /** How many progress segments boot occupies */
  bootWeight: 2,
  /** Number of onboarding tutorial steps (continue, tab+enter, click-tab) */
  onboardingSteps: 3,
} as const

/** Renderer font sizing */
export const FONT_SIZES = {
  gameFontSize:       'clamp(10px, 1.4vw, 16px)',
  gameLineHeight:     'clamp(13px, 1.75vw, 20px)',
  matrixFontSize:     'clamp(8px, 1.1vw, 12px)',
  matrixLineHeight:   'clamp(10px, 1.3vw, 14px)',
} as const

export const SIZES = {
  /** Mobile breakpoint below which console is hidden */
  mobileBreakpoint: 640,
} as const
