import type { StepDef } from '../types'

export const STEPS: StepDef[] = [
  {
    id: 'about',
    title: 'ABOUT',
    tabLabel: 'About',
    description: [
      "Hi — I'm a full-stack engineer with 6+ years shipping products at scale.",
      'I specialize in React, TypeScript, and cloud-native architecture.',
      "Currently focused on developer tooling and design systems.",
    ],
    hint: 'next',
    impact: [
      '6+ years across startups and scale-ups',
      'Led frontend architecture for 3 product teams',
      'Open-source contributor — 1.2k GitHub stars',
    ],
  },
  {
    id: 'project-1',
    title: 'PROJECT 1',
    tabLabel: 'Project 1',
    description: [
      'A fintech dashboard that reduced analyst workflow time by 40%.',
      'Built with React, D3, and a real-time WebSocket data layer.',
      'Handles 50k+ concurrent connections with sub-100ms latency.',
    ],
    hint: 'next',
    impact: [
      '40% reduction in analyst workflow time',
      '50k+ concurrent WebSocket connections',
      'Sub-100ms p95 latency',
      'Adopted by 3 enterprise clients in first quarter',
    ],
  },
  {
    id: 'project-2',
    title: 'PROJECT 2',
    tabLabel: 'Project 2',
    description: [
      'A design system powering 12 micro-frontends across the org.',
      '120+ accessible components with full Storybook documentation.',
      'Reduced UI development time by 60% and eliminated visual regressions.',
    ],
    hint: 'next',
    impact: [
      '120+ accessible components (WCAG AA)',
      '60% faster UI development across 12 teams',
      'Zero visual regressions in 8 months',
      '97% Storybook coverage',
    ],
  },
  {
    id: 'project-3',
    title: 'PROJECT 3',
    tabLabel: 'Project 3',
    description: [
      'A CLI tool for automating cloud infrastructure provisioning.',
      'Reduced deploy times from 45 min to under 3 min.',
      'Written in Go with Terraform integration and a plugin system.',
    ],
    hint: 'next',
    impact: [
      '15x faster deployments (45 min → 3 min)',
      '200+ internal users across engineering',
      'Plugin ecosystem with 18 community extensions',
      'Featured in company tech blog — 10k views',
    ],
  },
  {
    id: 'contact',
    title: 'CONTACT',
    tabLabel: 'Contact',
    description: [
      "Thanks for taking the tour — I'd love to connect.",
      'Feel free to reach out for roles, collaborations, or just to chat.',
      `Email: hello@example.dev`,
    ],
    hint: 'copy email',
    impact: [
      'Open to full-time and contract roles',
      'Available for consulting on React architecture',
      'Happy to chat about open-source collaboration',
    ],
  },
]

export const TOTAL_STEPS = STEPS.length

export const CONTACT_EMAIL = 'hello@example.dev'

/** Resolve a fuzzy step name to a step index. Returns -1 if not found. */
export function resolveStepArg(arg: string): number {
  const a = arg.toLowerCase().replace(/\s+/g, '')
  if (a === 'about') return 0
  if (a === 'project1' || a === 'p1') return 1
  if (a === 'project2' || a === 'p2') return 2
  if (a === 'project3' || a === 'p3') return 3
  if (a === 'contact') return 4
  return -1
}
