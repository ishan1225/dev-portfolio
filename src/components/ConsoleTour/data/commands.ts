import type { CommandDef, DisplayLine } from '../types'
import {
  PROJECTS, ABOUT_TOUR, CONTACT_TOUR,
  SKILL_GROUPS, EXPERIENCE, SOCIAL_LINKS, LOCATION,
} from '../../../data/portfolio'

let lineCounter = 0
const uid = () => `cmd-${++lineCounter}`

export const commands: CommandDef[] = [
  {
    name: 'about',
    description: 'Introduction and skills',
    visible: true,
    execute: () => ({
      lines: [
        { id: uid(), type: 'header', text: '── ABOUT ──' },
        ...ABOUT_TOUR.narrative.map(t => ({ id: uid(), type: 'content' as const, text: t })),
        { id: uid(), type: 'content', text: '' },
        ...SKILL_GROUPS.map(g => ({
          id: uid(), type: 'content' as const,
          text: `${g.label.padEnd(10)} — ${g.items.join(', ')}`,
        })),
      ],
    }),
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
    execute: () => ({
      lines: [
        { id: uid(), type: 'header', text: '── CONTACT ──' },
        ...CONTACT_TOUR.narrative.map(t => ({ id: uid(), type: 'content' as const, text: t })),
        { id: uid(), type: 'content', text: '' },
        ...SOCIAL_LINKS.map(s => ({ id: uid(), type: 'content' as const, text: `${s.label}: ${s.href}` })),
        { id: uid(), type: 'content', text: '' },
        { id: uid(), type: 'content', text: LOCATION },
      ],
      sideEffect: 'copy-email',
    }),
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
  {
    name: 'secret',
    description: 'Easter egg',
    visible: false,
    execute: () => ({
      lines: [
        { id: uid(), type: 'header', text: '── ??? ──' },
        { id: uid(), type: 'system', text: 'decrypting...' },
        { id: uid(), type: 'content', text: 'matrix donut coming soon.' },
      ],
      sideEffect: 'glitch',
      glitchIntensity: 0.7,
    }),
  },
  {
    name: 'fun',
    description: 'Easter egg',
    visible: false,
    execute: () => ({
      lines: [
        { id: uid(), type: 'header', text: '── ??? ──' },
        { id: uid(), type: 'system', text: 'initializing...' },
        { id: uid(), type: 'content', text: 'game coming soon.' },
      ],
      sideEffect: 'glitch',
      glitchIntensity: 0.5,
    }),
  },
]
