import type { StepDef } from '../types'
import { PROJECTS, ABOUT_TOUR, CONTACT_TOUR, CONTACT_EMAIL } from '../../../data/portfolio'

export { CONTACT_EMAIL }

const tourProjects = PROJECTS.filter(p => p.tourNarrative)

export const STEPS: StepDef[] = [
  {
    id: 'about',
    title: 'ABOUT',
    tabLabel: 'About',
    description: ABOUT_TOUR.narrative,
    hint: 'next',
    impact: ABOUT_TOUR.impact,
  },
  ...tourProjects.map((p, i) => ({
    id: `project-${i + 1}`,
    title: `PROJECT ${i + 1}`,
    tabLabel: `Project ${i + 1}`,
    description: p.tourNarrative!,
    hint: 'next',
    impact: p.impact,
  })),
  {
    id: 'contact',
    title: 'CONTACT',
    tabLabel: 'Contact',
    description: CONTACT_TOUR.narrative,
    hint: 'copy email',
    impact: CONTACT_TOUR.impact,
  },
]

export const TOTAL_STEPS = STEPS.length

/** Resolve a fuzzy step name to a step index. Returns -1 if not found. */
export function resolveStepArg(arg: string): number {
  const a = arg.toLowerCase().replace(/\s+/g, '')
  if (a === 'about') return 0
  if (a === 'contact') return STEPS.length - 1
  // match project1/p1 through projectN/pN
  const pm = a.match(/^(?:project|p)(\d+)$/)
  if (pm) {
    const n = parseInt(pm[1], 10)
    if (n >= 1 && n <= tourProjects.length) return n
  }
  return -1
}
