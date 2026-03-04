export interface SkillGroup {
  label: string
  items: string[]
}

export interface Project {
  title: string
  desc: string
  impact: string
  tags: string[]
  bullets: string[]
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

export const SKILL_GROUPS: SkillGroup[] = [
  { label: "Frontend", items: ["React", "TypeScript", "Tailwind", "Framer Motion", "D3"] },
  { label: "Backend", items: ["Node.js", "PostgreSQL", "GraphQL", "Redis", "REST"] },
  { label: "Infra", items: ["AWS", "Docker", "Terraform", "CI/CD"] },
]

export const PROJECTS: Project[] = [
  {
    title: "Fintech Dashboard",
    desc: "Real-time trading visualization with WebSocket streaming and D3 charts.",
    impact: "60% faster",
    tags: ["React", "D3", "WebSocket"],
    bullets: ["Sub-100ms streaming updates", "Custom D3 chart library with 12 viz types", "Load time cut from 4.2s to 1.7s"],
  },
  {
    title: "E-Commerce Platform",
    desc: "Full-stack marketplace with Stripe, real-time inventory, and search.",
    impact: "50k MAU",
    tags: ["Next.js", "Stripe", "PG"],
    bullets: ["End-to-end Stripe Connect checkout", "Real-time inventory sync across 3 warehouses", "Typo-tolerant search with faceting"],
  },
  {
    title: "Dev Tools CLI",
    desc: "Internal tooling automating deploys and environment provisioning.",
    impact: "200hrs saved",
    tags: ["Node", "TS", "AWS"],
    bullets: ["One-command environment setup", "Auto-rollback deploy pipelines", "Log aggregation across 40+ services"],
  },
  {
    title: "Data Pipeline",
    desc: "ETL system processing 2M+ records/day with quality checks and alerting.",
    impact: "2M/day",
    tags: ["Python", "AWS", "Docker"],
    bullets: ["Self-healing retries with dead-letter queues", "Automated data quality scoring", "Real-time anomaly alerting"],
  },
  {
    title: "Design System",
    desc: "Tokenized component library adopted across 4 product teams.",
    impact: "4 teams",
    tags: ["React", "TS", "Tailwind"],
    bullets: ["40+ production components", "Figma-to-code pipeline", "Dark/light theming with CSS variables"],
  },
  {
    title: "Auth Service",
    desc: "OAuth2 + SSO service handling 100k+ sessions/day.",
    impact: "100k/day",
    tags: ["Node", "Redis", "PG"],
    bullets: ["Multi-provider OAuth2 flows", "Rate limiting + fraud detection", "Session management at scale"],
  },
]

export const EXPERIENCE: Experience[] = [
  {
    role: "Senior Frontend Dev",
    company: "TechCorp",
    year: "2023–now",
    brief: "Led dashboard rewrite, cutting load time 60%.",
    details: [
      "Mentored 3 junior devs through code reviews and pair programming",
      "Built component library adopted across 4 product teams",
    ],
  },
  {
    role: "Full-Stack Developer",
    company: "StartupXYZ",
    year: "2021–2023",
    brief: "Built platform from zero to 50k MAU.",
    details: [
      "Owned frontend and API layer end-to-end",
      "Shipped Stripe integration processing $2M+/year",
    ],
  },
  {
    role: "Software Engineer",
    company: "MidCo",
    year: "2020–2021",
    brief: "Led microservices migration, reduced deploy time 80%.",
    details: [
      "Built internal developer CLI used by 30+ engineers",
      "Automated environment provisioning and deployment pipelines",
    ],
  },
  {
    role: "Junior Developer",
    company: "AgencyOne",
    year: "2019–2020",
    brief: "Shipped 12+ client projects across web and mobile.",
    details: [
      "First production React applications and component architecture",
      "Introduced to AWS infrastructure and CI/CD workflows",
    ],
  },
]

export const CONTACT_EMAIL = "your@email.com"

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "GitHub", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Resume", href: "#" },
]

export const LOCATION = "Toronto, ON · Remote friendly"
