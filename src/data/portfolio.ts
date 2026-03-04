export interface SkillGroup {
  label: string
  items: string[]
}

export interface Project {
  title: string
  desc: string
  impactBadge: string
  tags: string[]
  bullets: string[]
  impact: string[]
  tourNarrative?: string[]
}

export interface Experience {
  role: string
  company: string
  year: string
  brief: string
  details: string[]
}

export interface SocialLink {
  label: string
  href: string
}

export interface TourSection {
  narrative: string[]
  impact: string[]
}

export const SKILL_GROUPS: SkillGroup[] = [
  { label: "Frontend", items: ["React", "TypeScript", "Tailwind", "Framer Motion", "D3"] },
  { label: "Backend", items: ["Node.js", "PostgreSQL", "GraphQL", "Redis", "REST"] },
  { label: "Infra", items: ["AWS", "Docker", "Terraform", "CI/CD"] },
]

export const PROJECTS: Project[] = [
  {
    title: "Fintech Dashboard",
    desc: "Real-time trading visualization with WebSocket streaming and D3 charts.",
    impactBadge: "60% faster",
    tags: ["React", "D3", "WebSocket"],
    bullets: ["Sub-100ms streaming updates", "Custom D3 chart library with 12 viz types", "Load time cut from 4.2s to 1.7s"],
    impact: [
      "40% reduction in analyst workflow time",
      "50k+ concurrent WebSocket connections",
      "Sub-100ms p95 latency",
      "Adopted by 3 enterprise clients in first quarter",
    ],
    tourNarrative: [
      "A fintech dashboard that reduced analyst workflow time by 40%.",
      "Built with React, D3, and a real-time WebSocket data layer.",
      "Handles 50k+ concurrent connections with sub-100ms latency.",
    ],
  },
  {
    title: "E-Commerce Platform",
    desc: "Full-stack marketplace with Stripe, real-time inventory, and search.",
    impactBadge: "50k MAU",
    tags: ["Next.js", "Stripe", "PG"],
    bullets: ["End-to-end Stripe Connect checkout", "Real-time inventory sync across 3 warehouses", "Typo-tolerant search with faceting"],
    impact: [
      "50k monthly active users at peak",
      "$2M+ annual payment volume via Stripe Connect",
      "99.9% inventory accuracy across 3 warehouses",
    ],
  },
  {
    title: "Dev Tools CLI",
    desc: "Internal tooling automating deploys and environment provisioning.",
    impactBadge: "200hrs saved",
    tags: ["Node", "TS", "AWS"],
    bullets: ["One-command environment setup", "Auto-rollback deploy pipelines", "Log aggregation across 40+ services"],
    impact: [
      "15x faster deployments (45 min \u2192 3 min)",
      "200+ internal users across engineering",
      "Plugin ecosystem with 18 community extensions",
      "Featured in company tech blog \u2014 10k views",
    ],
    tourNarrative: [
      "A CLI tool for automating cloud infrastructure provisioning.",
      "Reduced deploy times from 45 min to under 3 min.",
      "Written in Go with Terraform integration and a plugin system.",
    ],
  },
  {
    title: "Data Pipeline",
    desc: "ETL system processing 2M+ records/day with quality checks and alerting.",
    impactBadge: "2M/day",
    tags: ["Python", "AWS", "Docker"],
    bullets: ["Self-healing retries with dead-letter queues", "Automated data quality scoring", "Real-time anomaly alerting"],
    impact: [
      "2M+ records processed daily with 99.99% uptime",
      "Self-healing retries reduced manual intervention by 90%",
      "Anomaly detection catches issues within 30 seconds",
    ],
  },
  {
    title: "Design System",
    desc: "Tokenized component library adopted across 4 product teams.",
    impactBadge: "4 teams",
    tags: ["React", "TS", "Tailwind"],
    bullets: ["40+ production components", "Figma-to-code pipeline", "Dark/light theming with CSS variables"],
    impact: [
      "120+ accessible components (WCAG AA)",
      "60% faster UI development across 12 teams",
      "Zero visual regressions in 8 months",
      "97% Storybook coverage",
    ],
    tourNarrative: [
      "A design system powering 12 micro-frontends across the org.",
      "120+ accessible components with full Storybook documentation.",
      "Reduced UI development time by 60% and eliminated visual regressions.",
    ],
  },
  {
    title: "Auth Service",
    desc: "OAuth2 + SSO service handling 100k+ sessions/day.",
    impactBadge: "100k/day",
    tags: ["Node", "Redis", "PG"],
    bullets: ["Multi-provider OAuth2 flows", "Rate limiting + fraud detection", "Session management at scale"],
    impact: [
      "100k+ sessions managed daily",
      "Multi-provider OAuth2 with SSO support",
      "Rate limiting blocked 99.7% of brute-force attempts",
    ],
  },
]

export const EXPERIENCE: Experience[] = [
  {
    role: "Senior Frontend Dev",
    company: "TechCorp",
    year: "2023\u2013now",
    brief: "Led dashboard rewrite, cutting load time 60%.",
    details: [
      "Mentored 3 junior devs through code reviews and pair programming",
      "Built component library adopted across 4 product teams",
    ],
  },
  {
    role: "Full-Stack Developer",
    company: "StartupXYZ",
    year: "2021\u20132023",
    brief: "Built platform from zero to 50k MAU.",
    details: [
      "Owned frontend and API layer end-to-end",
      "Shipped Stripe integration processing $2M+/year",
    ],
  },
  {
    role: "Software Engineer",
    company: "MidCo",
    year: "2020\u20132021",
    brief: "Led microservices migration, reduced deploy time 80%.",
    details: [
      "Built internal developer CLI used by 30+ engineers",
      "Automated environment provisioning and deployment pipelines",
    ],
  },
  {
    role: "Junior Developer",
    company: "AgencyOne",
    year: "2019\u20132020",
    brief: "Shipped 12+ client projects across web and mobile.",
    details: [
      "First production React applications and component architecture",
      "Introduced to AWS infrastructure and CI/CD workflows",
    ],
  },
]

export const CONTACT_EMAIL = "hello@example.dev"

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "GitHub", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Resume", href: "#" },
]

export const LOCATION = "Toronto, ON \u00B7 Remote friendly"

export const ABOUT_TOUR: TourSection = {
  narrative: [
    "Hi \u2014 I'm a full-stack engineer with 6+ years shipping products at scale.",
    "I specialize in React, TypeScript, and cloud-native architecture.",
    "Currently focused on developer tooling and design systems.",
  ],
  impact: [
    "6+ years across startups and scale-ups",
    "Led frontend architecture for 3 product teams",
    "Open-source contributor \u2014 1.2k GitHub stars",
  ],
}

export const CONTACT_TOUR: TourSection = {
  narrative: [
    "Thanks for taking the tour \u2014 I'd love to connect.",
    "Feel free to reach out for roles, collaborations, or just to chat.",
    `Email: ${CONTACT_EMAIL}`,
  ],
  impact: [
    "Open to full-time and contract roles",
    "Available for consulting on React architecture",
    "Happy to chat about open-source collaboration",
  ],
}
