import { memo, useEffect, useRef, type ReactNode } from 'react'
import { TerminalLine } from './TerminalLine'
import type { DisplayLine } from './types'

interface Props {
  lines: DisplayLine[]
  children?: ReactNode
}

export const TerminalBody = memo(function TerminalBody({ lines, children }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines, children])

  return (
    <div className="flex-1 overflow-y-auto px-3.5 lg:px-5 xl:px-6 py-3 lg:py-4 xl:py-5 text-sm lg:text-base">
      {lines.map(line => (
        <TerminalLine
          key={line.id}
          type={line.type}
          text={line.text}
          showCursor={line.showCursor}
        />
      ))}
      {children}
      <div ref={bottomRef} />
    </div>
  )
})
