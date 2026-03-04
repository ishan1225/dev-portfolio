export type LineType = 'system' | 'content' | 'header' | 'user' | 'error'

/** A fully-resolved line ready for rendering in TerminalBody */
export interface DisplayLine {
  id: string
  type: LineType
  text: string
  showCursor?: boolean
}

export interface BootLine {
  id: string
  type: LineType
  fullText: string
  revealedChars: number
}

export interface BootStoryEntry {
  type: LineType
  text: string
  /** ms from boot start when this line begins printing */
  delay: number
}

/** Configures which portfolio content appears in the tour and in what order */
export interface TourStepConfig {
  type: 'about' | 'project' | 'contact'
  /** Index into PROJECTS array — only for type: 'project' */
  index?: number
}

export interface StepDef {
  id: string
  title: string
  tabLabel: string
  /** Pre-built display lines (header + content) */
  lines: DisplayLine[]
  /** Real command shown as ghost hint to advance to next step */
  ghostHint: string
}

export interface CommandResult {
  lines: DisplayLine[]
  sideEffect?: 'copy-email' | 'glitch'
  glitchIntensity?: number
}

export interface CommandContext {
  currentStep: number
  totalSteps: number
}

export interface CommandDef {
  name: string
  description: string
  visible: boolean
  execute: (args: string, ctx: CommandContext) => CommandResult
}
