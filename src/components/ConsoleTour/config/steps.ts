import type { StepDef, DisplayLine } from '../types'
import { TOUR_STEPS, NAV_TIP } from './flow'
import {
  PROJECTS, ABOUT_TOUR, CONTACT_TOUR, CONTACT_EMAIL,
  SKILL_GROUPS, SOCIAL_LINKS, LOCATION,
} from './content'

export { CONTACT_EMAIL }

let lineCounter = 0
const uid = () => `step-${++lineCounter}`

/** Map a step's id to the command users type to navigate to it */
function stepCommand(step: StepDef): string {
  if (step.id === 'about') return 'about'
  if (step.id === 'contact') return 'contact'
  if (step.id.startsWith('project-')) return `project ${step.id.replace('project-', '')}`
  return step.id
}

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
          { id: uid(), type: 'content', text: '' },
          { id: uid(), type: 'system', text: NAV_TIP },
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
          { id: uid(), type: 'content', text: '' },
          { id: uid(), type: 'system', text: NAV_TIP },
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

  // Assign ghost hints + per-step pauseAfterMs
  for (let i = 0; i < steps.length; i++) {
    if (i < steps.length - 1) {
      steps[i].ghostHint = stepCommand(steps[i + 1])
    } else {
      // Last step hints at easter egg
      steps[i].ghostHint = 'secret'
    }

    // Apply step-level pauseAfterMs to last line of the step
    const pause = TOUR_STEPS[i].pauseAfterMs
    if (pause != null && steps[i].lines.length > 0) {
      steps[i].lines[steps[i].lines.length - 1].pauseAfterMs = pause
    }
  }

  return steps
}

export const STEPS = buildSteps()
export const TOTAL_STEPS = STEPS.length
export const INITIAL_GHOST_HINT = STEPS[0] ? stepCommand(STEPS[0]) : ''

/** Index of the contact step (-1 if none). Used for email-copy side-effect. */
export const CONTACT_STEP_INDEX = STEPS.findIndex(s => s.id === 'contact')

/** Resolve a fuzzy step name to a step index. Returns -1 if not found. */
export function resolveStepArg(arg: string): number {
  const a = arg.toLowerCase().replace(/\s+/g, '')

  // Look up by step id first (works for about, contact, any future types)
  const byId = STEPS.findIndex(s => s.id === a)
  if (byId >= 0) return byId

  // Project shorthand: "project 2" or "p2"
  const pm = a.match(/^(?:project|p)(\d+)$/)
  if (pm) {
    const n = parseInt(pm[1], 10)
    const projSteps = STEPS.filter(s => s.id.startsWith('project-'))
    if (n >= 1 && n <= projSteps.length) return STEPS.indexOf(projSteps[n - 1])
  }
  return -1
}
