import type { CommandDef } from '../types'

let lineCounter = 0
const uid = () => `cmd-${++lineCounter}`

export const commands: CommandDef[] = [
  {
    name: 'help',
    description: 'List available commands',
    visible: true,
    execute: (_args, _ctx) => {
      const names = commands.filter(c => c.visible).map(c => c.name)
      return {
        lines: [{ id: uid(), type: 'system', text: `commands: ${names.join(', ')}` }],
      }
    },
  },
  {
    name: 'clear',
    description: 'Clear the terminal',
    visible: true,
    execute: () => ({
      lines: [],
      sideEffect: 'clear',
    }),
  },
  {
    name: 'exit',
    description: 'Close the terminal',
    visible: true,
    execute: () => ({
      lines: [],
      sideEffect: 'exit',
    }),
  },
]
