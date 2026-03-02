import { useMemo } from 'react'
import { commands } from '../data/commands'
import type { CommandContext, CommandDef, CommandResult } from '../types'

let lineCounter = 0
const uid = () => `ucmd-${++lineCounter}`

export function useCommands() {
  const map = useMemo(() => {
    const m = new Map<string, CommandDef>()
    for (const cmd of commands) m.set(cmd.name, cmd)
    return m
  }, [])

  const execute = (rawInput: string, ctx: CommandContext): CommandResult => {
    const trimmed = rawInput.toLowerCase().trim()
    const spaceIdx = trimmed.indexOf(' ')
    const name = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx)
    const args = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx + 1).trim()

    const cmd = map.get(name)
    if (!cmd) {
      return {
        lines: [{ id: uid(), type: 'error', text: 'unknown command. try: help' }],
      }
    }

    return cmd.execute(args, ctx)
  }

  return { execute }
}
