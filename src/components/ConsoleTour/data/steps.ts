import type { StepDef, DisplayLine } from '../types'
import { TOUR_STEPS } from './tourConfig'
import {
  PROJECTS, ABOUT_TOUR, CONTACT_TOUR, CONTACT_EMAIL,
  SKILL_GROUPS, SOCIAL_LINKS, LOCATION,
} from '../../../data/portfolio'

export { CONTACT_EMAIL }

let lineCounter = 0
const uid = () => `step-${++lineCounter}`

function buildSteps(): StepDef[] {
  let projCounter = 0

  const steps = TOUR_STEPS.map((cfg) => {
    switch (cfg.type) {
      case 'about': {
        const lines: DisplayLine[] = [
          { id: uid(), type: 'header', text: '── ABOUT ──' },
          ...ABOUT_TOUR.narrative.map(t => ({ id: uid(), type: 'content' as const, text: t })),
          { id: uid(), type: 'content', text: '' },
          ...SKILL_GROUPS.map(g => ({
            id: uid(), type: 'content' as const,
            text: `${g.label.padEnd(10)} — ${g.items.join(', ')}`,
          })),
        ]
        return { id: 'about', title: 'ABOUT', tabLabel: 'About', lines, ghostHint: '' }
      }

      case 'project': {
        projCounter++
        const p = PROJECTS[cfg.index!]
        const lines: DisplayLine[] = [
          { id: uid(), type: 'header', text: `── ${p.title.toUpperCase()} ──` },
          ...(p.tourNarrative ?? []).map(t => ({ id: uid(), type: 'content' as const, text: t })),
          { id: uid(), type: 'content', text: '' },
          ...p.impact.map(t => ({ id: uid(), type: 'content' as const, text: `• ${t}` })),
        ]
        return {
          id: `project-${projCounter}`,
          title: p.title.toUpperCase(),
          tabLabel: `Proj ${projCounter}`,
          lines,
          ghostHint: '',
        }
      }

      case 'contact': {
        const lines: DisplayLine[] = [
          { id: uid(), type: 'header', text: '── CONTACT ──' },
          ...CONTACT_TOUR.narrative.map(t => ({ id: uid(), type: 'content' as const, text: t })),
          { id: uid(), type: 'content', text: '' },
          ...SOCIAL_LINKS.map(s => ({ id: uid(), type: 'content' as const, text: `${s.label}: ${s.href}` })),
          { id: uid(), type: 'content', text: '' },
          { id: uid(), type: 'content', text: LOCATION },
        ]
        return { id: 'contact', title: 'CONTACT', tabLabel: 'Contact', lines, ghostHint: '' }
      }
    }
  })

  // Assign ghost hints: each step hints at the command to reach the NEXT step
  for (let i = 0; i < steps.length; i++) {
    if (i < steps.length - 1) {
      const next = steps[i + 1]
      if (next.id === 'about') steps[i].ghostHint = 'about'
      else if (next.id === 'contact') steps[i].ghostHint = 'contact'
      else if (next.id.startsWith('project-')) {
        steps[i].ghostHint = `project ${next.id.replace('project-', '')}`
      }
    } else {
      // Last step (contact) hints at easter egg
      steps[i].ghostHint = 'secret'
    }
  }

  return steps
}

export const STEPS = buildSteps()
export const TOTAL_STEPS = STEPS.length
export const INITIAL_GHOST_HINT = 'about'

/** Resolve a fuzzy step name to a step index. Returns -1 if not found. */
export function resolveStepArg(arg: string): number {
  const a = arg.toLowerCase().replace(/\s+/g, '')
  if (a === 'about') return 0
  if (a === 'contact') return STEPS.length - 1
  const pm = a.match(/^(?:project|p)(\d+)$/)
  if (pm) {
    const n = parseInt(pm[1], 10)
    const projSteps = STEPS.filter(s => s.id.startsWith('project-'))
    if (n >= 1 && n <= projSteps.length) return STEPS.indexOf(projSteps[n - 1])
  }
  return -1
}
