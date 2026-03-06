import type { CommandDef, DisplayLine } from '../types'
import { STEPS } from './steps'
import { PROJECTS, EXPERIENCE } from './content'

let lineCounter = 0
const uid = () => `cmd-${++lineCounter}`

/** Clone a tour step's lines with fresh IDs. Returns null if step not found. */
function stepLines(id: string): DisplayLine[] | null {
  const step = STEPS.find(s => s.id === id)
  if (!step) return null
  return step.lines.map(l => ({ ...l, id: uid() }))
}

export const commands: CommandDef[] = [
  {
    name: 'about',
    description: 'Introduction and skills',
    visible: true,
    execute: () => {
      const lines = stepLines('about')
      return lines
        ? { lines }
        : { lines: [{ id: uid(), type: 'error', text: 'about section not available' }] }
    },
  },
  {
    name: 'experience',
    description: 'Work history',
    visible: true,
    execute: () => ({
      lines: [
        { id: uid(), type: 'header', text: '── EXPERIENCE ──' },
        ...EXPERIENCE.flatMap(e => [
          { id: uid(), type: 'content' as const, text: `${e.role} · ${e.company} · ${e.year}` },
          { id: uid(), type: 'content' as const, text: `  ${e.brief}` },
          { id: uid(), type: 'content' as const, text: '' },
        ]),
      ],
    }),
  },
  {
    name: 'projects',
    description: 'All projects overview',
    visible: true,
    execute: () => ({
      lines: [
        { id: uid(), type: 'header', text: '── PROJECTS ──' },
        ...PROJECTS.map((p, i) => ({
          id: uid(), type: 'content' as const,
          text: `${i + 1}. ${p.title} [${p.impactBadge}] — ${p.desc}`,
        })),
      ],
    }),
  },
  {
    name: 'project',
    description: 'Project details',
    visible: true,
    execute: (args) => {
      const n = parseInt(args, 10)
      if (isNaN(n) || n < 1 || n > PROJECTS.length) {
        return { lines: [{ id: uid(), type: 'error', text: `usage: project 1–${PROJECTS.length}` }] }
      }
      const p = PROJECTS[n - 1]
      const lines: DisplayLine[] = [
        { id: uid(), type: 'header', text: `── ${p.title.toUpperCase()} ──` },
        { id: uid(), type: 'content', text: p.desc },
        { id: uid(), type: 'content', text: '' },
        ...p.bullets.map(b => ({ id: uid(), type: 'content' as const, text: `• ${b}` })),
        { id: uid(), type: 'content', text: '' },
        ...p.impact.map(imp => ({ id: uid(), type: 'content' as const, text: `▸ ${imp}` })),
      ]
      return { lines }
    },
  },
  {
    name: 'contact',
    description: 'Contact info',
    visible: true,
    execute: () => {
      const lines = stepLines('contact')
      return lines
        ? { lines, sideEffect: 'copy-email' }
        : { lines: [{ id: uid(), type: 'error', text: 'contact section not available' }] }
    },
  },
  {
    name: 'help',
    description: 'Available commands',
    visible: true,
    execute: () => ({
      lines: [
        { id: uid(), type: 'header', text: '── COMMANDS ──' },
        { id: uid(), type: 'content', text: 'about         Introduction and skills' },
        { id: uid(), type: 'content', text: 'experience    Work history' },
        { id: uid(), type: 'content', text: 'projects      All projects overview' },
        { id: uid(), type: 'content', text: 'project <n>   Project details' },
        { id: uid(), type: 'content', text: 'contact       Contact info' },
        { id: uid(), type: 'content', text: 'help          This list' },
      ],
    }),
  },
]
