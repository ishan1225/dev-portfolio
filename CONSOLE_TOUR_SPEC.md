# ConsoleTour — Component Design Spec

## What This Is
`ConsoleTour` is a **component** inside a larger developer portfolio site. It's a guided, opt-in "console tour" — a playful terminal UI that lets anyone (including non-technical recruiters) explore your work in ~2–3 minutes. It's not a standalone app — it's one feature within your portfolio that can coexist with standard navigation, a landing page, and other portfolio sections.

## Project Context
- This component lives inside your main portfolio project
- The portfolio itself is a Vite + React + TS + Tailwind + Framer Motion app
- ConsoleTour should be **self-contained**: one component folder with its own hooks, data config, types, and styles
- Other portfolio pages/components will exist alongside it
- The landing page that triggers the console could be the portfolio's main landing, or a dedicated route — decide later

## Tech Stack (for the portfolio project)
- **Vite + React + TypeScript + Tailwind CSS + Framer Motion**
- **Deployment:** AWS S3 + CloudFront (static site)
- No Next.js, no shadcn, no SSR — pure client-side SPA

## Color Palette (EXACT — from concept art)
```
#181825  — Void           — Deepest background (behind terminal, landing page)
#222035  — Deep Space     — Primary background (terminal body)
#2F404D  — Deep Teal      — Borders, secondary bg, cards, dividers
#575267  — Muted Purple   — Disabled states, inactive text, dimmed UI
#8D8980  — Warm Gray      — System text, timestamps, metadata, close button
#B8B8C8  — Silver         — Body text, primary readable text
#65DC98  — Matrix Green   — Active states, prompts, primary accent, active tabs
#A0FFE3  — Mint Glow      — Headings, emphasis, highlights, title text
#85EBD9  — Cyan           — Hints, links, secondary accent
#FFB366  — Amber          — Error states (soft, not aggressive)
#E8E8F0  — Near White     — User input text
```

### Color Usage Specifics (from wireframe)
- **Header background:** `rgba(47,64,77,0.4)` (teal with transparency)
- **Input row background:** `rgba(47,64,77,0.2)` (subtler teal)
- **Tab inactive background:** `rgba(47,64,77,0.5)`
- **Tab active:** solid `#65DC98` bg with `#222035` text
- **Tab disabled (boot):** opacity 0.4, color `#575267`
- **Mode pill BOOTING:** `#8D8980` bg with `#222035` text
- **Mode pill GUIDED:** `#65DC98` bg with `#222035` text
- **Progress bar track:** `#2F404D`
- **Progress bar fill:** `linear-gradient(90deg, #65DC98, #A0FFE3)`
- **Progress step text:** `#8D8980`, font-size 9px
- **Border between all sections:** `1px solid #2F404D`
- **Terminal border/container:** `1px solid #2F404D`, border-radius 12px
- **Line prefixes:** `sys` in green (#65DC98), `→` in mint (#A0FFE3), `hint` in cyan (#85EBD9)

## Typography
- **Primary:** JetBrains Mono (terminal text, commands, output)
- **Fallback chain:** IBM Plex Mono → Courier New → monospace
- **Headers/Titles:** Space Mono (bolder weight) or JetBrains Mono bold
- **Size scale:** Title 12-14px, body 11-12px, metadata/labels 9-10px
- **Letter-spacing:** 1-2px on labels, mode pills, and footer hints
- **Line-height:** 1.7 in terminal body for readability
- **Tab font:** 9px, weight 600
- **Mode pill font:** 9px, weight 700, letter-spacing 1px
- **Close button:** 14px, weight 700

## Architecture: Single-Pane Terminal (NOT split)
The original wireframe showed a terminal + preview split. **We removed the split.**
- Rationale: Split attention kills onboarding. Users don't know where to look.
- The terminal body IS the content delivery. Section intros, project descriptions, links all render as styled terminal output with color and emphasis.
- This also makes responsive design trivial (single column scales from 320px to 1440px).

## Layout Structure
```
┌─────────────────────────────────────────┐
│ CONSOLE TOUR   [BOOTING|GUIDED]     [×] │  ← Header: title + mode pill + close
├─────────────────────────────────────────┤
│ [████████░░░░░░░░░░░░] 2/5              │  ← Progress: bar + step indicator
│ [About] [Project 1] [Project 2] ...     │  ← Tabs: clickable fallback nav
├─────────────────────────────────────────┤
│                                         │
│  sys  section loaded                    │  ← Terminal body: scrollable,
│  ── PROJECT 1 ──                        │     typewriter output,
│  A fintech dashboard that reduced...    │     color-coded line types
│  hint  type next or press Tab → Enter   │
│                                         │
├─────────────────────────────────────────┤
│ › next  ⇥                               │  ← Input: prompt + ghost hint
├─────────────────────────────────────────┤
│        ESC exit · TAB fill · ENTER run  │  ← Footer: one-line key hints
└─────────────────────────────────────────┘
```

### Visual Details per Section

**Header:**
- Flex row: title (left) + mode pill (center-left) + close button (right)
- Title: `CONSOLE TOUR` in mint (#A0FFE3), weight 700, 12-14px, letter-spacing 2px
- Mode pill: small rounded badge (border-radius 3px), 9px font, weight 700, letter-spacing 1px
- Close: `×` character in warm gray, 14px, weight 700, hover brightens
- Background: semi-transparent teal `rgba(47,64,77,0.4)`
- Bottom border: `1px solid #2F404D`

**Progress Row:**
- Thin bar (4px height) with rounded corners (2px)
- Track: `#2F404D`, fill: `linear-gradient(90deg, #65DC98, #A0FFE3)`
- During boot: fill animates from 0% to 100% over boot duration; label shows "BOOT"
- During guided: fill = `(currentStep / totalSteps) * 100`%; label shows "2/5" etc.
- 10px gap between bar and label
- Below the bar (6px margin): tab row

**Stepper Tabs:**
- Horizontal flex with 4px gap, flex-wrap for mobile
- Each tab: 3px vertical padding, 8px horizontal, border-radius 3px, font 9px weight 600
- Active: `#65DC98` bg, `#222035` text
- Inactive: `rgba(47,64,77,0.5)` bg, `#B8B8C8` text
- Disabled (boot): opacity 0.4, `#575267` text, cursor default
- Transition: `all 0.3s`

**Terminal Body:**
- Scrollable div, min-height ~140-200px, padding 12-14px
- Line-height 1.7 for comfortable reading
- Each line rendered with a type-specific style (see Line Type System below)
- During boot: blinking cursor (▌) after last typed character, opacity pulsing 0.3↔1.0
- Auto-scrolls to bottom; scroll-to-bottom indicator if user scrolled up

**Input Row:**
- Green (#65DC98) `›` prompt character, weight 700
- Input area with ghost hint text (italic, warm gray when hint, muted purple when booting)
- During boot: ghost text = "booting…" in muted purple
- During guided: ghost text = suggested command + `⇥` symbol
- Tab fills ghost text into real input
- Background: `rgba(47,64,77,0.2)`
- Top border: `1px solid #2F404D`

**Footer:**
- Single centered line: `ESC exit · TAB fill · ENTER run`
- Muted purple (#575267), 9px, letter-spacing 1px
- Top border: `1px solid #2F404D`
- Padding: 5px 14px

## Line Type Visual System
Each line type gets a distinct left-border color (3px) for scannable hierarchy:
```
SYSTEM  │ #8D8980 warmGray  │ "sys  initializing…"           │ prefix "sys" in green
CONTENT │ #A0FFE3 mint      │ "── PROJECT 1 ──" + body text  │ prefix "→" in mint, or section headers
HINT    │ #85EBD9 cyan      │ "hint  try: next"              │ prefix "hint" in cyan
USER    │ #E8E8F0 white     │ "> open 2"                     │ prefix ">" in green
ERROR   │ #FFB366 amber     │ "err  unknown command"         │ prefix "err" in amber
```

## Modes & Lifecycle

### 1. Landing Page (Closed State)
- Minimal page with a pulsing "Enter Console" button
- Background: void (#181825) or deep space (#222035)
- This can be the portfolio's main landing or a dedicated entry point
- Cool entry animation when clicked

### 2. Open Animation (~300ms)
- Terminal scales up from center (0.95→1.0) with opacity 0→1
- Use Framer Motion `AnimatePresence` + `motion.div` for mount/unmount
- Slight backdrop blur/darken behind terminal

### 3. Boot Phase (~5 seconds, total duration ~5200ms)
- Typewriter prints story lines at ~30ms per character
- Progress bar fills over duration
- Mode pill shows "BOOTING" (warmGray badge)
- Tabs are disabled (visually dimmed, opacity 0.4, not clickable)
- Input placeholder shows "booting…" in muted purple, italic
- If user types during boot, echo their input then respond: `sys  booting… one moment.`
- Boot always completes (time-based, not interaction-gated)
- Auto-transitions to Guided mode
- Blinking cursor visible during typewriter output

**Boot Story Lines (configurable via data file):**
```json
[
  { "type": "system",  "text": "initializing console…",                    "delay": 200 },
  { "type": "system",  "text": "loading portfolio data…",                  "delay": 900 },
  { "type": "content", "text": "hello there.",                              "delay": 1800 },
  { "type": "content", "text": "you found something most people skip.",     "delay": 2800 },
  { "type": "content", "text": "this is a guided tour of my work.",         "delay": 3600 },
  { "type": "hint",    "text": "boot complete. entering guided mode…",      "delay": 4400 }
]
```

### 4. Guided Phase
- Steps fixed: **About → Project 1 → Project 2 → Project 3 → Contact**
- Each step auto-clears terminal log and prints a mini "section intro"
- Mode pill switches to "GUIDED" (green badge)
- Tabs become clickable (full opacity, pointer cursor)
- Progress bar reflects current step (1/5, 2/5, etc.)
- Input hint shows the next suggested command as ghost text

**Per-step flow:**
1. Terminal clears (or smooth transition)
2. System line: `sys  section loaded`
3. Content header: `── ABOUT ──` (or project name) in mint, weight 600
4. Content body: 1-2 lines describing what's shown in silver
5. Hint line: `hint  type next or press Tab → Enter` in cyan
6. Input ghost text updates to suggested command (e.g., `next  ⇥`)

### 5. Close
- ESC key or × button (always works, both phases)
- Reverse of open animation: scale 1.0→0.95, opacity 1→0
- No confirmation dialog — trust the user
- Returns to landing page state

## Interaction Model

### Primary: Tab-to-Fill (non-nerds)
- Input shows ghost hint text (e.g., `next  ⇥`)
- Pressing Tab fills the ghost text into the actual input
- Pressing Enter executes the command
- This is the guided "happy path" — zero typing knowledge needed

### Secondary: Typing Commands (nerds)
- Users can type any command directly
- Ghost hint disappears as they type (replaced by their input)
- Blinking cursor in input field

### Tertiary: Clicking Tabs (fallback)
- Stepper tabs at top are clickable during Guided phase
- Immediately navigates to that step
- For people who refuse to type anything

## Command Registry

### Core Commands (Stage 2)
- `open 1|2|3` → jump to that project step
- `about` → jump to About step
- `contact` → jump to Contact step
- `next` / `back` → sequential step navigation
- `clear` → clear terminal log
- `help` → print one short line listing commands
- `exit` → close terminal (same as ESC/×)

### Contact Step Only
- `copy email` → copies email to clipboard, confirms in terminal

### Guided Hints per Step
Each step has a suggested command shown as ghost text:
- About: `next`
- Project 1: `next`
- Project 2: `next`
- Project 3: `next`
- Contact: `copy email`

### Easter Eggs (Stage 4 — design for extensibility now)
- `skills` → styled tech stack list
- `skills -a` → extended list with proficiency bars
- `sudo hire me` → playful "permission granted" + email
- `history` → all commands entered this session
- `theme matrix` → green-on-black rain effect (3s, auto-reverts)
- `coffee` → ASCII coffee cup
- `help -v` → verbose help revealing hidden commands

**Architecture note:** All commands (core + easter eggs) go through one command handler/registry. Adding new commands = adding entries to the registry data structure. Guided mode just pre-fills specific commands as hints. No separate parser for easter eggs.

## Build Stages

### Stage 1: Shell + Boot Animation ← START HERE
- [ ] Portfolio project scaffold (Vite + React + TS + Tailwind + Framer Motion)
- [ ] ConsoleTour component folder structure (see file structure below)
- [ ] Landing page with "Enter Console" button
- [ ] Terminal component with open/close animations (AnimatePresence)
- [ ] Terminal chrome: header, progress bar, tabs, body, input row, footer
- [ ] Typewriter engine hook (per-character reveal, configurable speed)
- [ ] Boot sequence: story lines with typewriter, progress bar fills, auto-transition to guided
- [ ] ESC closes terminal (always works)
- [ ] Boot-phase input responds: "booting… one moment."
- [ ] Blinking cursor during typewriter output

### Stage 2: Command System + Tab-Fill
- [ ] Command parser/registry (data-driven, easy to extend)
- [ ] Tab key fills ghost hint into input
- [ ] Enter executes command
- [ ] Ghost hint rendering in input (dimmed, disappears on typing)
- [ ] `help`, `clear`, `exit` commands
- [ ] Unknown command → friendly error: `err  unknown command. try: help`
- [ ] Command history (up/down arrow)

### Stage 3: Guided Flow + Content
- [ ] Step state machine (About → P1 → P2 → P3 → Contact)
- [ ] Section intro data (JSON config for each step — title, description lines, hint command)
- [ ] `next`, `back`, `open N`, `about`, `contact` commands
- [ ] Tab clicking navigates to step
- [ ] Progress bar syncs with current step
- [ ] Auto-clear terminal on step transitions
- [ ] Completion celebration: `✓ tour complete — 2:14`
- [ ] `copy email` command in Contact step

### Stage 4: Easter Eggs + Polish
- [ ] Hidden commands: `skills`, `skills -a`, `sudo hire me`, `history`, `coffee`
- [ ] `theme matrix` effect
- [ ] `help -v` reveals hidden commands
- [ ] Animation polish and timing tweaks
- [ ] Responsive cleanup (mobile ≥320px, tablet, desktop)
- [ ] Accessibility: focus management, aria labels, reduced-motion support
- [ ] Performance optimization

## Suggested File Structure
```
src/
├── components/
│   └── ConsoleTour/
│       ├── ConsoleTour.tsx        # Main component, state machine, AnimatePresence wrapper
│       ├── TerminalHeader.tsx     # Title + mode pill + close button
│       ├── TerminalProgress.tsx   # Progress bar + step tabs
│       ├── TerminalBody.tsx       # Scrollable line output + typewriter rendering
│       ├── TerminalInput.tsx      # Prompt + ghost hint + input handling
│       ├── TerminalFooter.tsx     # Key hints line
│       ├── TerminalLine.tsx       # Single line component with type-based styling
│       ├── hooks/
│       │   ├── useTypewriter.ts   # Per-character reveal hook
│       │   ├── useBootSequence.ts # Boot phase orchestration
│       │   └── useCommands.ts     # Command registry + parser (Stage 2)
│       ├── data/
│       │   ├── bootStory.ts       # Boot phase lines config
│       │   ├── steps.ts           # Step definitions: about, projects, contact (Stage 3)
│       │   └── commands.ts        # Command registry entries (Stage 2+)
│       ├── types.ts               # LineType, Step, Command, Mode, etc.
│       └── constants.ts           # Colors (C object), timing values, sizes
├── pages/
│   └── Landing.tsx                # Landing page with console trigger
└── App.tsx
```

## UX Guardrails
- **No command can break the UI.** Every input is safe.
- **Unknown commands** get a friendly response: `err  unknown command. try: help`
- **During boot**, commands respond but don't navigate: `sys  booting… one moment.`
- **ESC always exits.** No confirmation. No delay.
- **No dead ends.** Every state has a clear next action.
- **Auto-scroll** to bottom as new lines appear, but user can scroll up to review.
- **Scroll-to-bottom** indicator appears if user has scrolled up and new content arrives.

## Key Design Decisions
1. **Single pane, not split** — focus over flexibility
2. **About first** — context before projects
3. **5s boot** — sets tone without frustrating
4. **No confirmation on exit** — trust builds confidence
5. **Ghost text Tab-fill** — feels like terminal, requires zero knowledge
6. **Line-type left-border colors** — scannable hierarchy without icons
7. **All content/commands as data** — easy to reconfigure without code changes
8. **Component is self-contained** — can drop into any React app
