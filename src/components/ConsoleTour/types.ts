export type LineType = 'system' | 'content' | 'hint' | 'user' | 'error'

export type Mode = 'boot' | 'guided'

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

export interface StepDef {
  id: string
  title: string
  tabLabel: string
  description: string[]
  hint: string
  impact?: string[]
}

export interface CommandResult {
  lines: DisplayLine[]
  sideEffect?: 'clear' | 'exit' | 'navigate' | 'copy-email'
  navigateTo?: number
}

export interface CommandContext {
  mode: Mode
  currentStep: number
  totalSteps: number
}

export interface CommandDef {
  name: string
  description: string
  visible: boolean
  execute: (args: string, ctx: CommandContext) => CommandResult
}
