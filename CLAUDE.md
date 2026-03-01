# Project: Developer Portfolio

## Quick Context
This is a personal developer portfolio built with Vite + React + TypeScript + Tailwind CSS + Framer Motion. Deployed to AWS S3 + CloudFront as a static site.

## Key Component: ConsoleTour
The main interactive feature is a guided terminal-style tour. The full design spec lives in `CONSOLE_TOUR_SPEC.md` — **read it before making any changes to the ConsoleTour component**. It contains the exact color palette, visual details, interaction model, command registry, and build stages.

## Build Stages
We're building ConsoleTour in 4 stages. Check `CONSOLE_TOUR_SPEC.md` for the current stage checklist. Complete one stage at a time — don't jump ahead.

## Conventions
- All ConsoleTour code lives in `src/components/ConsoleTour/`
- Colors, timing, and sizes are defined in `constants.ts` — never hardcode them elsewhere
- Commands and content are data-driven (JSON/TS config files in `data/`) — not hardcoded in components
- Use Framer Motion for all animations (AnimatePresence for mount/unmount, motion.div for transitions)
- Use Tailwind for layout/spacing, but the color system uses CSS variables or the constants file (since colors are very specific hex values from the design spec)
