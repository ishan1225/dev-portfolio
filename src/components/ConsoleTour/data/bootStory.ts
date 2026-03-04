import type { BootStoryEntry } from '../types'

export const bootStory: BootStoryEntry[] = [
  { type: 'system',  text: 'initializing console\u2026',                    delay: 200  },
  { type: 'system',  text: 'loading portfolio data\u2026',                  delay: 900  },
  { type: 'content', text: 'hello there.',                                   delay: 1800 },
  { type: 'content', text: 'you found something most people skip.',          delay: 2800 },
  { type: 'content', text: 'this is a guided tour of my work.',              delay: 3600 },
  { type: 'system',  text: 'boot complete.',                                   delay: 4400 },
]
