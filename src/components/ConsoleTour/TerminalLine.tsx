import type { LineType } from './types'

interface LineConfig {
  borderCls: string
  prefix: string
  prefixCls: string
  textCls: string
  prefixMinW: string
}

// Full Tailwind class strings are listed explicitly so the JIT scanner picks them up
const LINE_CONFIG: Record<LineType, LineConfig> = {
  system:  { borderCls: 'border-l-warm-gray',  prefix: 'sys',  prefixCls: 'text-matrix-green', textCls: 'text-warm-gray',  prefixMinW: 'min-w-7 lg:min-w-8'   },
  content: { borderCls: 'border-l-mint-glow',  prefix: '→',    prefixCls: 'text-mint-glow',    textCls: 'text-silver',     prefixMinW: 'min-w-4 lg:min-w-5'   },
  hint:    { borderCls: 'border-l-cyan',        prefix: 'hint', prefixCls: 'text-cyan',         textCls: 'text-cyan',       prefixMinW: 'min-w-8 lg:min-w-9'   },
  user:    { borderCls: 'border-l-near-white',  prefix: '>',    prefixCls: 'text-matrix-green', textCls: 'text-near-white', prefixMinW: 'min-w-3.5 lg:min-w-4' },
  error:   { borderCls: 'border-l-amber',       prefix: 'err',  prefixCls: 'text-amber',        textCls: 'text-amber',      prefixMinW: 'min-w-7 lg:min-w-8'   },
}

interface Props {
  type: LineType
  text: string
  showCursor?: boolean
}

export function TerminalLine({ type, text, showCursor }: Props) {
  const cfg = LINE_CONFIG[type]

  return (
    <div
      className={`flex gap-2.5 lg:gap-3 xl:gap-3.5 leading-[1.7] pl-2.5 lg:pl-3 xl:pl-3.5 mb-0.5 lg:mb-1 border-l-[3px] lg:border-l-4 ${cfg.borderCls}`}
    >
      <span className={`${cfg.prefixCls} ${cfg.prefixMinW} font-semibold shrink-0`}>
        {cfg.prefix}
      </span>
      <span className={cfg.textCls}>
        {text}
        {showCursor && <span className="cursor-blink text-matrix-green">▌</span>}
      </span>
    </div>
  )
}
