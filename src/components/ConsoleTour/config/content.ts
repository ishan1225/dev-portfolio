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

// ─── Skills ─────────────────────────────────────────────────────────

export const SKILL_GROUPS: SkillGroup[] = [
  { label: "Languages & Frameworks", items: ["TypeScript", "React", "Next.js", "Node.js", "NestJS", "Python", "FastAPI", "Flask", "C/C++", "LangChain"] },
  { label: "Data & Search", items: ["PostgreSQL", "Redis", "Cassandra", "DynamoDB", "Kafka", "Elasticsearch"] },
  { label: "Cloud & Infra", items: ["AWS", "Lambda", "SQS", "SES", "ECS", "CloudFormation", "IoT Core", "Docker", "Kubernetes", "Terraform", "GitHub Actions"] },
  { label: "Quality & Ops", items: ["TestContainers", "Datadog", "Prometheus", "Grafana", "Kibana"] },
]

// ─── Projects ───────────────────────────────────────────────────────

export const PROJECTS: Project[] = [
  // {
  //   title: "AI Prescreener & RAG Chatbot",
  //   desc: "OpenAI-powered intake prescreener and LLM support chatbot with hybrid retrieval.",
  //   impactBadge: "sped up intake",
  //   tags: ["OpenAI", "LangChain", "Next.js", "pgvector"],
  //   bullets: [
  //     "Built prescreener for adaptive response classification and follow-ups",
  //     "Delivered RAG chatbot with tiered models and A/B-tested prompts",
  //     "Selected pgvector on AWS over Pinecone/Chroma for cost + latency",
  //   ],
  //   impact: [
  //     "Sped up intake and reduced screening churn",
  //     "Controlled token spend with tiered model strategy",
  //     "Prompt guardrails cut hallucinations and kept tone on-brand",
  //     "Quality/latency/cost measured on fixed test sets",
  //   ],
  //   tourNarrative: [
  //     "Built AI-powered intake tools and an LLM support chatbot.",
  //     "Hybrid RAG pipeline with tiered models — cost-effective for retrieval, high-quality for synthesis.",
  //     "Sped up intake, reduced churn, and measured everything on fixed test sets.",
  //   ],
  // },
  {
    title: "Tutor Intake Platform",
    desc: "Cut time-to-enrollment by 50% \u2014 idea to V1 in 12 weeks, led two junior engineers.",
    impactBadge: "2\u00D7 enrollment speed",
    tags: ["Next.js", "Node.js", "PostgreSQL", "Redis"],
    bullets: [
      "Owned platform from idea \u2192 V1 in ~12 weeks, shipped V2 next quarter",
      "Built search/filtering across tutor candidates",
      "Orchestrated outreach (scheduled nudges, SMS webhooks)",
    ],
    impact: [
      "Cut time-to-enrollment by ~50%",
      "Step-by-step intake wizard shipped in Sales Portal",
      "Idea to V1 in ~12 weeks, led two junior engineers",
    ],
    tourNarrative: [
      "A tutoring intake platform I owned from idea to V1 in ~12 weeks.",
      "Built search/filtering, outreach orchestration, and a step-by-step intake wizard.",
      "Cut time-to-enrollment by ~50%. Led two junior engineers and shipped V2 the following quarter.",
    ],
  },
  {
    title: "Test Pipeline Optimization",
    desc: "Saved 200+ dev hours/week \u2014 cut a pipeline running hundreds of times/day from 20 to 4 min.",
    impactBadge: "200+ dev hrs/wk saved",
    tags: ["Node.js", "Docker", "TestContainers"],
    bullets: [
      "Cut a heavily used pipeline (hundreds of runs/day) from 20 \u2192 4 min with TestContainers",
      "Removed team reliance on the slow pipeline entirely",
      "Led reliability improvements via testing-first culture and incident tooling",
    ],
    impact: [
      "Saved 200+ dev hours per week across engineering",
      "80% pipeline reduction (20 \u2192 4 min, hundreds of runs/day)",
      "Drove testing-first culture that improved overall code quality",
    ],
    tourNarrative: [
      "A heavily used CI pipeline (hundreds of runs/day) was costing 200+ dev hours a week.",
      "Cut it from 20 \u2192 4 min with TestContainers, then removed reliance on it entirely.",
      "Drove a testing-first culture that improved overall code quality.",
    ],
  },
  {
    title: "AI RAG Chatbot",
    desc: "Customer-support chatbot from concept to pilot \u2014 reduced MTTR with AI-powered incident tooling.",
    impactBadge: "concept \u2192 pilot",
    tags: ["FastAPI", "Python", "PostgreSQL", "Redis", "CloudFormation", "ECS"],
    bullets: [
      "Led concept \u2192 pilot for an LLM customer-support RAG chatbot",
      "Hybrid RAG pipeline with tiered models and A/B-tested prompts",
      "Self-hosted pgvector on AWS over Pinecone/Chroma for cost + latency",
      "Deployed on ECS Fargate via CloudFormation with automated CI/CD",
      "Built AI Slack bot integrating OpenAI + Jira for high-urgency alert triage",
    ],
    impact: [
      "Reduced MTTR with AI-powered incident triage and context-rich alerts",
      "Controlled token spend with tiered model strategy",
      "Prompt guardrails cut hallucinations and kept tone on-brand",
    ],
    tourNarrative: [
      "Led an LLM customer-support chatbot from concept to pilot at LotusFlare.",
      "Hybrid RAG pipeline with tiered models \u2014 cost-effective for retrieval, high-quality for synthesis.",
      "Built an AI Slack bot for incident triage, reducing MTTR with context-rich alerts.",
    ],
  },
  {
    title: "Promotions & Billing Microservice",
    desc: "1M+ concurrent requests, zero production incidents \u2014 migrated from monolith and load-tested to death.",
    impactBadge: "0 incidents \u00B7 1M+ req",
    tags: ["NestJS", "TypeScript", "PostgreSQL", "Kafka", "Redis", "Cassandra", "Kubernetes"],
    bullets: [
      "Led monolith \u2192 microservices migration end-to-end",
      "Built APIs with NestJS/TypeScript, Kafka, Redis, Cassandra, PostgreSQL",
      "Load-tested and tuned for campaigns serving 1M+ concurrent requests",
      "Instrumented Grafana, Kibana, and Prometheus dashboards",
    ],
    impact: [
      "1,000,000+ concurrent requests served reliably across multi-day campaigns",
      "Zero production incidents",
      "Tuned Redis/Cassandra access patterns for scale",
    ],
    tourNarrative: [
      "Led a monolith \u2192 microservices migration for a high-throughput promotions and billing service.",
      "NestJS, Kafka, Redis, Cassandra, Kubernetes \u2014 load-tested to death, zero production incidents.",
      "Served 1,000,000+ concurrent requests during campaigns with tuned access patterns.",
    ],
  },
  {
    title: "IoT Cleaning Monitor",
    desc: "Extended sensor battery life from weeks to 2 years \u2014 saved a customer $500k/yr in costs.",
    impactBadge: "$500k/yr saved",
    tags: ["FastAPI", "React", "AWS IoT", "SQS"],
    bullets: [
      "Built full platform: FastAPI backend + React frontend",
      "Optimized sensor data efficiency, extended battery life, cut transmission costs",
      "ETL pipeline for sensor data via AWS SQS",
      "Automated device provisioning with AWS IoT Core",
      "Managed weekly deployments on AWS",
    ],
    impact: [
      "Saved a customer $500k/yr in operational costs",
      "Extended sensor battery life from weeks to 2 years, making the product viable",
    ],
    tourNarrative: [
      "First employee at Mero \u2014 built their IoT cleaning monitoring platform from scratch.",
      "Extended sensor battery life from weeks to 2 years through data efficiency optimization.",
      "Saved a customer $500k/yr in costs and made the product commercially viable.",
    ],
  },
  // {
  //   title: "Whisper Transcription Service",
  //   desc: "OpenAI Whisper-based service turning call audio into structured notes.",
  //   impactBadge: "automation",
  //   tags: ["Python", "OpenAI Whisper", "NLP"],
  //   bullets: [
  //     "Turned call audio into structured notes for staff intake",
  //     "Enabled downstream automation workflows",
  //     "Sped up intake process significantly",
  //   ],
  //   impact: [
  //     "Automated intake from call recordings",
  //     "Enabled downstream automation pipelines",
  //     "Reduced manual transcription overhead",
  //   ],
  // },
]

// ─── Experience ─────────────────────────────────────────────────────

export const EXPERIENCE: Experience[] = [
  {
    role: "Senior Product Engineer",
    company: "Rigoris Digital",
    year: "2025\u2013now",
    brief: "Full stack consulting for startups \u2014 built a tutor intake platform that cut enrollment time by 50%.",
    details: [
      "Owned tutor intake platform from idea \u2192 V1 in 12 weeks, shipped V2 next quarter",
      "Led two junior engineers; partnered with Product to scope, iterate, and ship",
      "Stack: Next.js, React, TypeScript, Tailwind, Node.js, PostgreSQL, Redis",
    ],
  },
  {
    role: "Senior Software Engineer",
    company: "LotusFlare",
    year: "2021\u20132024",
    brief: "Full stack \u2014 RAG chatbot, promotions & billing microservice, CI pipeline optimization at telecom scale.",
    details: [
      "Led RAG chatbot from concept \u2192 pilot; built AI Slack bot that reduced MTTR",
      "Led Promotions & Billing monolith \u2192 microservices migration \u2014 1M+ concurrent requests, zero incidents",
      "Saved 200+ dev hours/week by cutting CI pipeline 80% (20 \u2192 4 min)",
    ],
  },
  {
    role: "Software Engineer",
    company: "Mero Technologies",
    year: "2018\u20132021",
    brief: "Employee #1 \u2014 full stack, built IoT cleaning monitor platform from scratch.",
    details: [
      "FastAPI backend, React frontend, AWS IoT Core, SQS-based ETL",
      "Extended sensor battery life from weeks to 2 years; saved a customer $500k/yr",
    ],
  },
  {
    role: "Embedded Software Engineer",
    company: "VS Entertainment",
    year: "2017\u20132018",
    brief: "Remote management system for escape rooms \u2014 React + Flask.",
    details: [
      "Python/MySQL REST API for real-time prop updates",
      "Streamlined ops, reducing staff requirements for room management",
    ],
  },
  {
    role: "Embedded Software Engineer",
    company: "NeuronicWorks",
    year: "2015\u20132017",
    brief: "Lead dev/consultant \u2014 IoT, C, and C++ focused embedded projects.",
    details: [
      "Requirements analysis and rapid prototyping for startup clients",
      "TCP/IP, IoT wireless, bare-metal C and C++ development",
    ],
  },
]

// ─── Contact & Social ───────────────────────────────────────────────

export const CONTACT_EMAIL = "ishan.sharma@torontomu.ca"

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/ishan1225" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/i-sharma/" },
  { label: "Resume", href: "/resume.pdf" },
]

export const LOCATION = "Toronto, ON \u00B7 Remote friendly"

// ─── Tour Sections ──────────────────────────────────────────────────

export const ABOUT_TOUR: TourSection = {
  narrative: [
    "Hi \u2014 I'm Ishan. Full-stack engineer, 10+ years across IoT, telecom, and AI.",
    "I love building high-quality software on high-impact teams.",
    "B.Eng. Electrical Engineering from Ryerson. Currently at Rigoris Digital.",
  ],
  impact: [
    "10+ years across startups and scale-ups",
    "Led AI/ML integrations (RAG, Whisper, OpenAI) in production",
    "Employee #1 at a startup, senior IC at a telecom-scale company",
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
    "Interested in AI/ML, developer tooling, and product engineering",
    "Toronto-based, remote friendly",
  ],
}
