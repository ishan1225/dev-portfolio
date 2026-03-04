import type { CommandDef } from '../types'
import { STEPS, TOTAL_STEPS, resolveStepArg } from './steps'
import { SKILL_GROUPS } from '../../../data/portfolio'

let lineCounter = 0
const uid = () => `cmd-${++lineCounter}`

export const commands: CommandDef[] = [
  {
    name: 'help',
    description: 'List available commands',
    visible: true,
    execute: (_args, _ctx) => {
      const names = commands.filter(c => c.visible).map(c => c.name)
      return {
        lines: [{ id: uid(), type: 'system', text: `commands: ${names.join(', ')}` }],
      }
    },
  },
  {
    name: 'clear',
    description: 'Clear the terminal',
    visible: true,
    execute: () => ({
      lines: [],
      sideEffect: 'clear',
    }),
  },
  {
    name: 'exit',
    description: 'Close the terminal',
    visible: true,
    execute: () => ({
      lines: [],
      sideEffect: 'exit',
    }),
  },
  {
    name: 'next',
    description: 'Go to next step',
    visible: true,
    execute: (_args, ctx) => {
      if (ctx.currentStep >= ctx.totalSteps - 1) {
        return { lines: [{ id: uid(), type: 'system', text: 'already at last step.' }] }
      }
      return { lines: [], sideEffect: 'navigate', navigateTo: ctx.currentStep + 1 }
    },
  },
  {
    name: 'back',
    description: 'Go to previous step',
    visible: true,
    execute: (_args, ctx) => {
      if (ctx.currentStep <= 0) {
        return { lines: [{ id: uid(), type: 'system', text: 'already at first step.' }] }
      }
      return { lines: [], sideEffect: 'navigate', navigateTo: ctx.currentStep - 1 }
    },
  },
  {
    name: 'open',
    description: 'Open project N (1–3)',
    visible: true,
    execute: (args, _ctx) => {
      const n = parseInt(args, 10)
      if (isNaN(n) || n < 1 || n > 3) {
        return { lines: [{ id: uid(), type: 'error', text: 'usage: open 1|2|3' }] }
      }
      return { lines: [], sideEffect: 'navigate', navigateTo: n }
    },
  },
  {
    name: 'about',
    description: 'Go to About',
    visible: true,
    execute: () => ({
      lines: [],
      sideEffect: 'navigate',
      navigateTo: 0,
    }),
  },
  {
    name: 'contact',
    description: 'Go to Contact',
    visible: true,
    execute: () => ({
      lines: [],
      sideEffect: 'navigate',
      navigateTo: TOTAL_STEPS - 1,
    }),
  },
  {
    name: 'project',
    description: 'Open project N (1–3)',
    visible: true,
    execute: (args, _ctx) => {
      const n = parseInt(args, 10)
      if (isNaN(n) || n < 1 || n > 3) {
        return { lines: [{ id: uid(), type: 'error', text: 'usage: project 1|2|3' }] }
      }
      return { lines: [], sideEffect: 'navigate', navigateTo: n }
    },
  },
  {
    name: 'copy email',
    description: 'Copy email to clipboard',
    visible: true,
    execute: (_args, ctx) => {
      if (ctx.currentStep !== TOTAL_STEPS - 1) {
        return { lines: [{ id: uid(), type: 'system', text: 'navigate to Contact first.' }] }
      }
      return { lines: [], sideEffect: 'copy-email' }
    },
  },
  {
    name: 'skills',
    description: 'Show tech stack',
    visible: true,
    execute: () => ({
      lines: [
        { id: uid(), type: 'content', text: '── SKILLS ──' },
        ...SKILL_GROUPS.map(g => ({
          id: uid(),
          type: 'content' as const,
          text: `${g.label.padEnd(10)} — ${g.items.join(', ')}`,
        })),
      ],
    }),
  },
  {
    name: 'impact',
    description: 'Show impact metrics',
    visible: true,
    execute: (args, ctx) => {
      const a = args.trim().toLowerCase().replace(/\s+/g, '')

      // impact --all / -all / -a → every step
      if (a === '--all' || a === '-all' || a === '-a') {
        const lines = STEPS.flatMap(step => {
          if (!step.impact?.length) return []
          return [
            { id: uid(), type: 'content' as const, text: `── IMPACT: ${step.title} ──` },
            ...step.impact.map(l => ({ id: uid(), type: 'content' as const, text: `• ${l}` })),
            { id: uid(), type: 'content' as const, text: '' },
          ]
        })
        return { lines }
      }

      // impact <step-name> → specific step
      if (a) {
        const idx = resolveStepArg(a)
        if (idx === -1) {
          return { lines: [{ id: uid(), type: 'error', text: 'usage: impact [--all | about | project1 | contact]' }] }
        }
        const step = STEPS[idx]
        if (!step.impact?.length) {
          return { lines: [{ id: uid(), type: 'system', text: `no impact data for ${step.title}.` }] }
        }
        return {
          lines: [
            { id: uid(), type: 'content', text: `── IMPACT: ${step.title} ──` },
            ...step.impact.map(l => ({ id: uid(), type: 'content' as const, text: `• ${l}` })),
          ],
        }
      }

      // impact (no args) → current step
      const step = STEPS[ctx.currentStep]
      if (!step?.impact?.length) {
        return { lines: [{ id: uid(), type: 'system', text: 'no impact data for this step.' }] }
      }
      return {
        lines: [
          { id: uid(), type: 'content', text: `── IMPACT: ${step.title} ──` },
          ...step.impact.map(l => ({ id: uid(), type: 'content' as const, text: `• ${l}` })),
        ],
      }
    },
  },
]
