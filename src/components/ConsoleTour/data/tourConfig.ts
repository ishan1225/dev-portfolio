import type { TourStepConfig } from '../types'

/**
 * Ordered list of portfolio content to feature in the console tour.
 * Tabs, progress, and ghost hints all derive from this config.
 * The [???] easter egg tab is always appended implicitly (not listed here).
 *
 * To change what appears in the tour, edit this array:
 * - Reorder entries to change tab order
 * - Change `index` to feature a different project
 * - Add/remove entries — tabs and progress auto-adapt
 */
export const TOUR_STEPS: TourStepConfig[] = [
  { type: 'about' },
  { type: 'project', index: 0 },  // Fintech Dashboard
  { type: 'project', index: 2 },  // Dev Tools CLI
  { type: 'project', index: 4 },  // Design System
  { type: 'contact' },
]
