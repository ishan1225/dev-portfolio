import type { BootStoryEntry, TourStepConfig } from '../types'
import { TIMING } from './constants'

/**
 * Console flow "script" — the full sequence from open to close.
 * Each phase has its content AND timing co-located.
 *
 * Phase order: Open → Boot → Onboarding → Tour → Easter Eggs → Close
 */

// ─── Phase 1: Terminal Open (CRT power-on) ──────────────────────────

export const OPEN_ANIMATION = {
  flashMs: 100,   // scale overshoot + fade in
  scanMs: 280,   // scanline glitch + horizontal jitter
} as const

// ─── Phase 2: Boot Sequence ─────────────────────────────────────────

/**
 * Boot lines — typed char-by-char on terminal open.
 * Each line types at TIMING.typewriterMs per character.
 * pauseAfterMs = how long to wait after typing finishes before the next line.
 */
export const BOOT_LINES: BootStoryEntry[] = [
  { type: 'system', text: 'initializing console\u2026', pauseAfterMs: 100 },
  { type: 'system', text: 'loading portfolio data\u2026', pauseAfterMs: 400 },
  { type: 'content', text: 'hello there.', pauseAfterMs: 600 },
  { type: 'content', text: 'you found something most people skip.', pauseAfterMs: 500 },
  { type: 'content', text: 'this is a guided tour of my work.', pauseAfterMs: 400 },
  { type: 'system', text: 'boot complete.', pauseAfterMs: 1000 },
]

/** Auto-computed from BOOT_LINES — change the lines, this updates automatically. */
export const BOOT_DURATION_MS = BOOT_LINES.reduce(
  (sum, line) => sum + line.text.length * TIMING.typewriterMs + (line.pauseAfterMs ?? TIMING.linePauseMs),
  0,
)

// ─── Phase 3: Onboarding Tutorial ───────────────────────────────────
// Title + callout animation timing is in OnboardingOverlay.tsx.
// Farewell is typed into the terminal body like any other line.

export const NAV_TIP = 'tip: tabs, Continue ▸, and commands — all three work.'

// ─── Phase 4: Tour Steps ────────────────────────────────────────────

/**
 * Tour step ordering — tabs, progress, and ghost hints all derive from this.
 * Add/remove/reorder entries — everything adapts automatically.
 *
 * - type: 'about' | 'project' | 'contact'
 * - index: which project (indexes into PROJECTS in content.ts)
 * - pauseAfterMs: optional pause after this step's last line
 */
export const TOUR_STEPS: TourStepConfig[] = [
  { type: 'about' },
  { type: 'project', index: 0 },  // Tutor Intake Platform
  { type: 'project', index: 1 },  // Test Pipeline Optimization
  { type: 'project', index: 2 },  // AI RAG Chatbot
  { type: 'contact' },
]

// ─── Phase 5+6: Easter Eggs ─────────────────────────────────────────

/**
 * - triggers: commands that activate this easter egg
 * - message: typewriter text shown before renderer swap
 * - pauseAfterMs: reading pause after message finishes typing
 * - tabLabel: tab text once revealed (replaces unrevealedLabel)
 */
export const EASTER_EGGS = {
  secret: {
    triggers: ['secret'] as readonly string[],
    message: 'Bonus section unlocked. Hello Neo, do you like donuts with your coffee?',
    pauseAfterMs: 1200,
    tabLabel: 'Donut',
    unrevealedLabel: '???',
  },
  fun: {
    triggers: ['fun', 'game', 'play'] as readonly string[],
    message: 'booting up Robo Hop... beep boop',
    pauseAfterMs: 1200,
    tabLabel: 'Robo Hop',
    unrevealedLabel: '???',
  },
} as const

// ─── Phase 7: Terminal Close (CRT power-off) ────────────────────────

export const CLOSE_ANIMATION = {
  compressMs: 240,   // squish vertically, brightness spike
  lineMs: 200,   // hold as glowing horizontal line
  dotMs: 300,   // collapse width to zero, afterglow fades
} as const
