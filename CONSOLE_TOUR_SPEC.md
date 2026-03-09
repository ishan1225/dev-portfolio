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
┌───────────────────────────────────────────────┐
│ CONSOLE TOUR                              [×] │  ← Header: title + close
├───────────────────────────────────────────────┤
│ [████████░░░░░░░░░░░░] 2/6                    │  ← Progress bar + step count
│ [About] [Proj 1] [Proj 2] [Proj 3] [Contact] [▸] │  ← Tabs + next button
├───────────────────────────────────────────────┤
│                                               │
│  ── ABOUT ──                                  │  ← Terminal body: auto-scrolling,
│  Hi — I'm a full-stack engineer...            │     line-stagger reveal (~80ms),
│  I specialize in React, TypeScript...         │     auto-clears between commands
│                                               │
├───────────────────────────────────────────────┤
│ › project 1  ⇥                                │  ← Input: prompt + real command hint
├───────────────────────────────────────────────┤
│  ESC close · TAB fill · ↑↓ history            │  ← Footer: key hints
└───────────────────────────────────────────────┘

After reaching Contact, [???] tab fades in:
│ [About] [Proj 1] [Proj 2] [Proj 3] [Contact] [???] [▸] │

After completing [???], [▸] hides:
│ [About] [Proj 1] [Proj 2] [Proj 3] [Contact] [???]     │
```

### Visual Details per Section

**Header:**
- Flex row: title (left) + `[×]` close button (right)
- Title: `CONSOLE TOUR` in mint (#A0FFE3), weight 700, 12-14px, letter-spacing 2px
- Close: `×` character in warm gray, 14px, weight 700, hover brightens
- No mode pill, no next button in header — `[▸]` lives in the tab row
- Background: semi-transparent teal `rgba(47,64,77,0.4)`
- Bottom border: `1px solid #2F404D`

**Progress Row:**
- Thin bar (4px height) with rounded corners (2px)
- Track: `#2F404D`, fill: `linear-gradient(90deg, #65DC98, #A0FFE3)`
- During boot: fill animates from 0% to 100% over boot duration; label shows "BOOT"
- During tour: fill = `(currentStep / totalSteps) * 100`%; label shows "2/5" etc.
- Progress bar dims/hides after tour completion
- 10px gap between bar and label
- Below the bar (6px margin): tab row

**Stepper Tabs + `[▸]` Button:**
- Horizontal flex with 4px gap, flex-wrap for mobile
- Each tab: 3px vertical padding, 8px horizontal, border-radius 3px, font 9px weight 600
- Active: `#65DC98` bg, `#222035` text
- Inactive: `rgba(47,64,77,0.5)` bg, `#B8B8C8` text
- Disabled (boot only): opacity 0.4, `#575267` text, cursor default
- Always visible and clickable after boot
- `[▸]` button: sits at END of tab row, same visual style as tabs
- `[▸]` clicks auto-type and run the current ghost hint command
- `[▸]` pulses subtly on first interaction (with ghost hint) to draw attention
- After first successful command, stop pulsing
- If user does nothing for ~3s on first interaction, pulse again (one nudge)
- `[▸]` hides after tour is fully complete (post-easter-eggs)
- Transition: `all 0.3s`

**`[???]` Easter Egg Tab:**
- Hidden initially — only 5 tabs visible (About through Contact)
- Fades in after user reaches Contact step
- Pulses when it first appears to signal "there's more"
- Contains both `secret` (matrix donut) and `fun` (game) as one experience
- Clicking `[???]` navigates to it, same as typing `secret`
- Progress recalculates: was showing `5/5`, now shows `5/6` when `[???]` appears
- After completing `[???]`: progress = `6/6`, `[▸]` hides, tour complete

**Terminal Body:**
- Scrollable div, min-height ~140-200px, padding 12-14px
- Line-height 1.7 for comfortable reading
- Auto-clears between commands (each command replaces previous output)
- Content appears via line-stagger (~80ms between lines), NOT per-character typewriter
- Per-character typewriter only during boot phase
- During boot: blinking cursor (▌) after last typed character, opacity pulsing 0.3↔1.0
- Auto-scrolls to bottom

**Input Row:**
- Green (#65DC98) `›` prompt character, weight 700, subtle pulse on first interaction
- Ghost hint shows REAL commands (e.g. `about ⇥`, `project 1 ⇥`) — never `next`
- During boot: ghost text = "booting…" in muted purple, italic
- Tab fills ghost text into real input, Enter executes
- Stronger glow on input area (pronounced box-shadow / border glow)
- 40 character input limit
- Background: `rgba(47,64,77,0.2)`
- Top border: `1px solid #2F404D`

**Footer:**
- Single centered line: `ESC close · TAB fill · ↑↓ history · ENTER run`
- Muted purple (#575267), 9px, letter-spacing 1px
- Top border: `1px solid #2F404D`
- Padding: 5px 14px

## Line Type Visual System
Simplified — no prefixes on system/content, no inline hint lines:
```
SYSTEM  │ no border │ dim muted-purple text, no prefix │ "section loaded" (quiet metadata)
CONTENT │ no border │ silver text, no prefix           │ "Hi — I'm a full-stack engineer..."
HEADER  │ no border │ mint text, weight 600            │ "── ABOUT ──"
USER    │ no border │ near-white text, ">" prefix      │ "> about"
ERROR   │ no border │ amber text, no prefix            │ "unknown command — type help"
```
- No left-border colors on any line type (cleaner look)
- No `sys`, `→`, `hint`, or `err` prefixes (less noise)
- Hints live ONLY in the input bar ghost text, never in terminal output
- System messages are the quietest element — dim, brief, ignorable

## Lifecycle (No Modes)

There are no user-facing modes. The terminal is always the same — hints guide you, but you can type anything at any time.

### 1. Landing Page (Closed State)
- Minimal page with a pulsing "Enter Console" button
- Background: void (#181825) or deep space (#222035)
- Cool entry animation when clicked

### 2. Open Animation (~300ms)
- Terminal scales up from center (0.95→1.0) with opacity 0→1
- Use Framer Motion `AnimatePresence` + `motion.div` for mount/unmount
- Slight backdrop blur/darken behind terminal

### 3. Boot Phase (~5 seconds, total duration ~5200ms)
- Typewriter prints story lines at ~30ms per character (ONLY phase with per-char typewriter)
- Progress bar fills over duration
- Tabs are disabled (visually dimmed, opacity 0.4, not clickable)
- Input placeholder shows "booting…" in muted purple, italic
- If user types during boot, echo their input then respond: `booting… one moment.`
- Boot always completes (time-based, not interaction-gated)
- Auto-transitions to interactive state
- Blinking cursor visible during typewriter output

**Boot Story Lines (configurable via data file):**
```json
[
  { "type": "system",  "text": "initializing console…",                    "delay": 200 },
  { "type": "system",  "text": "loading portfolio data…",                  "delay": 900 },
  { "type": "content", "text": "hello there.",                              "delay": 1800 },
  { "type": "content", "text": "you found something most people skip.",     "delay": 2800 },
  { "type": "content", "text": "this is a guided tour of my work.",         "delay": 3600 },
  { "type": "system",  "text": "boot complete.",                            "delay": 4400 }
]
```

### 4. Interactive (Post-Boot)
- Terminal auto-clears boot output
- Ghost hint shows `about ⇥` — first real command
- `[▸]` button and ghost hint pulse once to draw attention
- Tabs become clickable (full opacity, pointer cursor)
- Progress bar reflects current step
- User runs commands via Tab→Enter, typing, clicking `[▸]`, or clicking tabs

**Per-command flow:**
1. Terminal auto-clears previous output
2. Content header: `── ABOUT ──` in mint, weight 600
3. Content body: lines stagger in (~80ms each) in silver
4. Ghost hint updates to next suggested command
5. User can follow hints OR type any command they want

### 5. Tour Sequence
Linear hint progression through content + easter eggs:
```
about → project 1 → project 2 → project 3 → contact → secret → fun
```
- `contact` auto-copies email and shows confirmation
- After contact: `[???]` tab fades in with pulse, progress becomes `5/6`
- Ghost hint shows `secret ⇥`, `[▸]` advances to `[???]` tab
- `secret` plays matrix donut animation
- Ghost hint shows `fun ⇥`
- `fun` boots mini game
- After `fun` → progress hits `6/6`, `[▸]` hides, outro message
- Ghost hint shows `type anything or press ESC`
- Tour is over but terminal stays open — user can keep exploring

### 6. Close
- ESC key or × button (always works, all phases)
- Reverse of open animation: scale 1.0→0.95, opacity 1→0
- No confirmation dialog — trust the user
- Returns to landing page state

## Interaction Model

### Primary: Tab-to-Fill + `[▸]` Button (non-nerds)
- Ghost hint shows real command (e.g., `about ⇥`)
- **Tab** fills the ghost text into the actual input, **Enter** executes
- **`[▸]` button** at end of tab row does both in one click (auto-types and runs hint)
- On first interaction, both `[▸]` and ghost hint pulse subtly to draw attention
- If user does nothing for ~3s, pulse again (one nudge, not nagging)
- After first successful command, stop pulsing — they've learned

### Secondary: Typing Commands (nerds)
- Users can type any command directly at any time
- Ghost hint disappears as they type (replaced by their input)
- Arrow up/down recalls command history
- 40 character input limit

### Tertiary: Clicking Tabs (universal)
- Tabs always visible and clickable (after boot)
- Immediately navigates to that step
- Works alongside hints and typing — not a separate mode

## Command Registry (Final — Stage 5+)

### Content Commands
- `about` → intro narrative + skills inline
- `experience` → work history (roles, companies, years, briefs)
- `projects` → all projects summary (title + impact badge + one-liner each)
- `project <n>` → project N details (description, bullets, tags, impact metrics)
- `contact` → contact info + social links, auto-copies email to clipboard

### Utility Commands
- `help` → prints command list directly in terminal output

### Easter Egg Commands
- `secret` → matrix donut animation (spinning donut with falling green characters)
- `fun` → mini game (keyboard-driven, plays in terminal area)

### Navigation (no commands — UI only)
- **Tabs:** click to jump to any step
- **Arrow up/down:** implicit command history (no `history` command)
- **ESC / `[×]`:** close terminal (no `exit` command)
- **`[▸]` button:** clicks and runs the current ghost hint command
- **Tab key:** fills ghost hint, Enter runs it

### Ghost Hint Sequence (guided tour)
Each step's ghost hint is a REAL command, not `next`:
```
post-boot   → about ⇥              [▸] advances to About tab
about       → project 1 ⇥          [▸] advances to Proj 1 tab
project 1   → project 2 ⇥          [▸] advances to Proj 2 tab
project 2   → project 3 ⇥          [▸] advances to Proj 3 tab
project 3   → contact ⇥            [▸] advances to Contact tab
contact     → secret ⇥             [???] tab appears, [▸] advances to it
secret      → fun ⇥                still within [???] tab
fun         → (outro)              [▸] hides, 6/6 complete
```

### Unknown Commands
- Friendly response: `unknown command — type help`

**Architecture note:** All commands go through one command handler/registry. Adding new commands = adding entries to the registry data structure. The guided flow just pre-fills specific commands as ghost hints. No modes, no locking.

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

### Stage 4: Landing Page
- [ ] Full scrollable portfolio page (hero, about, skills, projects, experience, contact)
- [ ] Data-driven content from `src/data/portfolio.ts`
- [ ] Responsive layout with Tailwind breakpoints (`sm:` = 640px)
- [ ] Expandable project rows (green `border-l`) and experience rows (cyan `border-l`)
- [ ] AnimatePresence expand/collapse animations
- [ ] Mobile sticky bottom bar with action buttons
- [ ] Click-to-copy email with "copied!" feedback
- [ ] "show N more" toggle for desktop projects

### Stage 5: Terminal UX Overhaul

Goal: get the terminal to its final UX state with placeholder easter eggs.

**5a: Unify Content** ✅
- [x] Single source of truth in `portfolio.ts` (`impactBadge`, `impact[]`, `tourNarrative?`)
- [x] `steps.ts` builds dynamically from portfolio data
- [x] `commands.ts` skills from `SKILL_GROUPS`
- [x] Landing page shows impact points on expand
- [x] Unified `CONTACT_EMAIL`

**5b: Tour Config + Content Decoupling**
- [ ] Create `src/components/ConsoleTour/data/tourConfig.ts`
- [ ] Config is an ordered list picking which portfolio content to feature:
  ```ts
  export const TOUR_STEPS: TourStepConfig[] = [
    { type: 'about' },
    { type: 'project', index: 0 },  // Fintech Dashboard
    { type: 'project', index: 2 },  // Dev Tools CLI
    { type: 'project', index: 4 },  // Design System
    { type: 'contact' },
  ]
  ```
- [ ] Tabs, progress, ghost hints all derive from this config
- [ ] `[???]` easter egg tab always appended after configured steps (not in config)
- [ ] Adding/removing/reordering projects in config = tabs/progress/hints auto-adapt
- [ ] Adding projects to `portfolio.ts` doesn't break tour (landing page picks them up, tour only shows configured ones)

**5c: Strip & Simplify Line Types**
- [ ] Remove `sys` prefix — system lines become dim muted-purple, no left border
- [ ] Remove `→` prefix from content lines — just indented text
- [ ] Remove inline `hint` lines from terminal output entirely
- [ ] Hints live ONLY in the input bar as ghost text
- [ ] Content lines appear via fast line-stagger (~80ms between lines), NOT per-character typewriter
- [ ] Keep per-character typewriter only for boot phase
- [ ] Auto-clear terminal between commands (no `clear` command needed)

**5d: Redesign Header + Tab Row**
- [ ] Remove mode pill (`GUIDED` / `BOOTING`) — no modes exposed to user
- [ ] Header simplified to: `CONSOLE TOUR [×]`
- [ ] `[▸]` button at END of tab row (same visual style as tabs)
- [ ] `[▸]` clicks auto-type and run the current ghost hint command
- [ ] `[▸]` and ghost hint pulse subtly on first interaction to draw attention
- [ ] If user does nothing for ~3s, pulse again (one nudge, not nagging)
- [ ] After first successful command, stop pulsing
- [ ] After tour fully complete (post-easter-eggs), `[▸]` hides
- [ ] `[???]` tab hidden initially, fades in with glitch transition after Contact
- [ ] `[???]` pulses when it appears
- [ ] Clicking `[???]` = typing `secret`
- [ ] Progress shows `/N` initially (N = config steps), becomes `/(N+1)` when `[???]` appears

**5e: Redesign Input Bar**
- [ ] Stronger glow on input area (more pronounced `box-shadow` / border glow)
- [ ] `›` prompt pulses softly on first interaction
- [ ] Ghost hint shows REAL commands, not `next` (e.g. `about ⇥`, `project 1 ⇥`)
- [ ] 40 character input limit
- [ ] After first successful command, stop pulsing

**5f: Rework Guided Flow (No Modes)**
- [ ] No `GUIDED` / `FREE` mode distinction — terminal is always the same
- [ ] Tour progresses via ghost hints that suggest the next real command
- [ ] Tabs always visible and clickable (both during tour and after)
- [ ] Progress bar visible during tour sequence, dims after tour ends
- [ ] User can type ANY command at ANY time — nothing is locked behind modes

**Tour hint sequence (derived from tourConfig):**
```
Step 0 (post-boot):  ghost hint = "about ⇥"         tabs: N visible, progress 0/N
Step 1 (about):      ghost hint = "project 1 ⇥"     progress 1/N
Step 2 (project 1):  ghost hint = "project 2 ⇥"     progress 2/N
  ...                                                 ...
Step N-1 (project):  ghost hint = "contact ⇥"       progress (N-1)/N
Step N (contact):    auto-copies email               progress N/N → [???] fades in → N/(N+1)
                     ghost hint = "secret ⇥"         glitch transition plays
Step N+1 (???):      secret plays (placeholder)      progress N/(N+1)
                     ghost hint = "fun ⇥"
                     fun plays (placeholder)          progress (N+1)/(N+1), [▸] hides, outro
```

**5g: Rework Command Registry**

Final command list (8 commands):

| Command | Behavior |
|---------|----------|
| `about` | Intro narrative + skills shown inline |
| `experience` | Work history (roles, companies, briefs) |
| `projects` | All projects summary (title + badge + one-liner) |
| `project <n>` | Project N detail + impact inline |
| `contact` | Contact info, auto-copies email to clipboard, shows confirmation |
| `help` | Prints command list in terminal (NOT an overlay) |
| `secret` | Placeholder: prints "matrix donut coming soon" + glitch transition |
| `fun` | Placeholder: prints "game coming soon" + glitch transition |

**Removed commands:** `next`, `back`, `clear`, `exit`, `free`, `tour`, `open`, `impact`, `skills`, `copy email`, `history`

**Navigation:** Tabs (click to jump), arrow up/down (implicit history), ghost hints (guided progression)

**Closing:** ESC key or `[×]` button only

**5h: Glitch Transitions**
- [ ] Reuse boot scanline animation as "glitch transition" effect
- [ ] Plays when `[???]` tab appears (after Contact)
- [ ] Plays when `secret` command runs (slightly more intense variant)
- [ ] Plays when `fun` command runs (another variant)
- [ ] Same animation code, different timing/intensity constants
- [ ] Cool text can appear during glitch (e.g. "decrypting..." for secret reveal)

**5i: Content Commands**
- [ ] `about`: show narrative + skills groups inline (no separate `skills` command)
- [ ] `project <n>`: show description + bullets + impact metrics inline (no separate `impact` command)
- [ ] `contact`: auto-copy email on display + show social links + confirmation message
- [ ] `experience`: show all roles with company, year, brief
- [ ] `projects`: show all projects as compact list (title + badge + one-liner)
- [ ] `help`: print grouped command list in terminal
- [ ] Keep sections tight — if 8+ lines, trim content

**5j: Footer Update**
- [ ] Update to: `ESC close · TAB fill · ↑↓ history · ENTER run`

**5k: Animation Polish**
- [ ] Line stagger: ~80ms between lines for content (not per-character)
- [ ] First-interaction pulse on `[▸]` button and ghost hint (one pulse, then stop)
- [ ] If user does nothing for ~3 seconds on first interaction, pulse again (one gentle nudge)

### Stage 6: Easter Eggs
- [ ] `secret` → matrix donut: spinning ASCII donut rendered with falling green matrix characters
- [ ] `fun` → mini game (snake, breakout, or similar keyboard-driven game in terminal area)
- [ ] Glitch transition variants for each (more intense than `[???]` reveal)
- [ ] Outro sequence after `fun` completes (tour truly done)
- [ ] Replace stage 5 placeholders with real implementations

### Stage 7: Polish
- [x] Make matrix donut font responsive (clamp like game font)
- [x] React.memo on TerminalLine and TerminalBody
- [x] Skip tutorial on return: persist `tutorialCompleted` to localStorage, skip the interactive intro for returning visitors
- [x] Wire in real portfolio data, SEO meta, favicon, headshot
- [x] Remove unused reference files

### Stage 8: Post-V1
- [x] ~~Update resume to match website content and host as downloadable PDF~~
- [x] ~~Wire real Resume URL into social links once PDF is hosted~~
- [ ] **Make resume download more accessible/prominent** (high priority — currently only at bottom in Contact)
- [ ] Add GitHub/Demo links per project card in Featured Work (currently commented out in Landing.tsx)
- [ ] Modal accessibility (focus trap, aria-labels, role)
- [ ] Mobile fallback for ConsoleTour
- [ ] Increase touch targets on tabs to 44px minimum
- [ ] Reuse game grid buffers instead of allocating per frame
- [ ] Cross-browser testing
- [ ] Animation timing fine-tuning

## Suggested File Structure
```
src/
├── data/
│   └── portfolio.ts               # Single source of truth: projects, experience, skills, about, contact
├── components/
│   └── ConsoleTour/
│       ├── ConsoleTour.tsx         # Main component, state machine, AnimatePresence wrapper
│       ├── TerminalHeader.tsx      # Title + close button
│       ├── TerminalProgress.tsx    # Progress bar + step tabs + [▸] button + [???] tab
│       ├── TerminalBody.tsx        # Scrollable line output, line-stagger rendering
│       ├── TerminalInput.tsx       # Prompt + ghost hint + input handling (40 char limit)
│       ├── TerminalFooter.tsx      # Key hints line
│       ├── TerminalLine.tsx        # Single line component (simplified — no prefixes/borders)
│       ├── hooks/
│       │   ├── useTypewriter.ts    # Per-character reveal hook (boot phase only)
│       │   ├── useBootSequence.ts  # Boot phase orchestration
│       │   └── useCommands.ts      # Command registry + parser
│       ├── data/
│       │   ├── bootStory.ts        # Boot phase lines config
│       │   ├── tourConfig.ts       # Ordered list of which portfolio content to feature in tour
│       │   ├── steps.ts            # Step definitions built from tourConfig + portfolio.ts
│       │   └── commands.ts         # Command registry entries (8 commands)
│       ├── types.ts                # LineType, Step, Command, etc.
│       └── constants.ts            # Colors (C object), timing values, sizes
├── pages/
│   └── Landing.tsx                 # Landing page with console trigger
└── App.tsx
```

## UX Guardrails
- **No command can break the UI.** Every input is safe.
- **Unknown commands** get a friendly response: `unknown command — type help`
- **During boot**, commands respond but don't navigate: `booting… one moment.`
- **ESC always exits.** No confirmation. No delay.
- **No dead ends.** Ghost hint always shows next action. `[▸]` always clickable.
- **Auto-clear** between commands — each command starts with a fresh terminal body.
- **Auto-scroll** to bottom as new lines stagger in.
- **Content is decoupled.** `portfolio.ts` = content, `tourConfig.ts` = which content the tour features. Adding/removing projects doesn't break anything.

## Key Design Decisions
1. **Single pane, not split** — focus over flexibility
2. **No modes** — no GUIDED/FREE distinction, just a terminal with helpful hints
3. **Hints are real commands** — ghost text shows `about`, `project 1`, not `next`
4. **5s boot** — sets tone without frustrating
5. **No confirmation on exit** — trust builds confidence
6. **Three input paths** — Tab-fill (noobs), typing (nerds), `[▸]` button (click-first users)
7. **Auto-clear between commands** — no `clear` command, each command starts fresh
8. **No prefixes on output** — no `sys`, `→`, `hint` noise. Clean text.
9. **Easter eggs in the tour flow** — `secret` and `fun` are part of the hint sequence, not hidden
10. **All content/commands as data** — easy to reconfigure without code changes
11. **Component is self-contained** — can drop into any React app
12. **8 commands total** — minimal, memorable, no command bloat
