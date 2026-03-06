# ConsoleTour — Configuration Guide

All config lives in `config/`. Edit one folder to change everything.

## File Map

| File | What it controls |
|------|-----------------|
| `config/flow.ts` | Boot lines, tour step order, easter egg triggers/messages/timing/labels |
| `config/content.ts` | About text, projects, contact info, skills, social links |
| `config/steps.ts` | Derived StepDef[] from flow + content (builders + resolvers) |
| `config/commands.ts` | Command handlers — `about`/`contact` derive from steps |
| `config/constants.ts` | Global defaults: TIMING, PROGRESS, FONT_SIZES, SIZES, C (colors) |
| `utils/asciiRunner.ts` | Game physics constants (gravity, speed, jump) |
| `utils/matrixDonut.ts` | Matrix rain + donut renderer config |
| `OnboardingOverlay.tsx` | Tutorial callout messages and positions |

---

## Tour Steps: `config/flow.ts` → `TOUR_STEPS`

Add, remove, or reorder entries — tabs, progress bar, ghost hints, and step navigation all adapt automatically.

```ts
export const TOUR_STEPS: TourStepConfig[] = [
  { type: 'about' },
  { type: 'project', index: 0 },
  { type: 'project', index: 2 },
  { type: 'contact' },
]
```

- **Remove a project** → delete the line. Tabs shrink, progress recalculates.
- **Add a project** → add `{ type: 'project', index: N }` where N indexes into `PROJECTS` in `config/content.ts`.
- **Reorder** → move entries. Ghost hints auto-chain (each step hints at the next).
- **Easter egg** → always reveals after the last step (whatever it is).
- **Email copy** → triggers on any step with `id === 'contact'`, regardless of position.

## Boot Sequence: `config/flow.ts` → `BOOT_LINES`

Each line has `type`, `text`, and optional `pauseAfterMs` (ms to wait after typing finishes).
`BOOT_DURATION_MS` is auto-computed from the lines — no manual sync needed.

```ts
{ type: 'system', text: 'boot complete.', pauseAfterMs: 1000 }
```

## Easter Eggs: `config/flow.ts` → `EASTER_EGGS`

```ts
export const EASTER_EGGS = {
  secret: {
    triggers: ['secret'],           // commands that activate this
    message: '...',                  // typewriter text before renderer swap
    pauseAfterMs: 1200,             // reading pause after message
    tabLabel: 'Donut',              // tab text once revealed
    unrevealedLabel: '???',         // tab text before activation
  },
  fun: { ... },
}
```

## Timing: `config/constants.ts` → `TIMING`

| Key | Default | What it does |
|-----|---------|-------------|
| `typewriterMs` | 30 | Ms per character during typewriter reveal |
| `linePauseMs` | 100 | Default ms between lines (`pauseAfterMs` on individual lines overrides) |
| `nudgeDelayMs` | 3000 | Ms before Continue button starts pulsing |
| `onboardingClearBootMs` | 600 | Ms to wait before clearing boot text when tutorial starts |
| `onboardingTitleMs` | 700 | Ms before "3 ways to navigate" title appears |
| `onboardingCalloutMs` | 1500 | Ms before first callout arrow appears |
| `farewellNavMs` | 1800 | Tutorial farewell: load content under overlay |
| `farewellDismissMs` | 2500 | Tutorial farewell: dismiss overlay |

### Progress: `PROGRESS`

| Key | Default | What it does |
|-----|---------|-------------|
| `bootWeight` | 2 | How many progress segments boot occupies |
| `onboardingSteps` | 3 | Number of tutorial steps (continue, tab+enter, click-tab) |

Formula: `totalSegments = bootWeight + onboardingSteps + visibleTourSteps`

### Renderer Fonts: `FONT_SIZES`

| Key | Default |
|-----|---------|
| `gameFontSize` | 16px |
| `gameLineHeight` | 20px |
| `matrixFontSize` | 12px |
| `matrixLineHeight` | 1.15 |

---

## Architecture

```
config/flow.ts         ← the "script" (boot, tour order, easter eggs)
config/content.ts      ← portfolio data (about, projects, contact, skills)
config/steps.ts        ← builds StepDef[] with lines, tabs, ghost hints
config/commands.ts     ← command handlers (derives about/contact from steps)
config/constants.ts    ← timing, sizing, colors
    ↓
useTourFlow.ts         ← state machine: step, easter egg phase, progress
    ↓
ConsoleTour.tsx         ← orchestrator: wires everything, handles input routing
    ↓
TerminalProgress.tsx   ← renders tabs + progress bar from step data
TerminalBody.tsx       ← renders queued lines
TerminalInput.tsx      ← prompt + ghost hint
MatrixDonutRenderer    ← easter egg 1 (matrix mode)
GameRenderer           ← easter egg 2 (game mode)
OnboardingOverlay      ← tutorial callouts (steps 0-2) + farewell (step 3)
```

### What won't auto-adapt

The **onboarding tutorial** (OnboardingOverlay) teaches "click About to jump there" — if About isn't the first tab, update the message text in `STEP_CONFIG` inside `OnboardingOverlay.tsx`. The callout arrow already points at whichever tab is first.
