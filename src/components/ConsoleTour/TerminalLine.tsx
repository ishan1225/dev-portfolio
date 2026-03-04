import type { LineType } from './types'

interface LineConfig {
  textCls: string
  prefix: string
  fontWeight: string
}

const LINE_CONFIG: Record<LineType, LineConfig> = {
  system:  { textCls: 'text-muted-purple', prefix: '',  fontWeight: '' },
  content: { textCls: 'text-silver',       prefix: '',  fontWeight: '' },
  header:  { textCls: 'text-mint-glow',    prefix: '',  fontWeight: 'font-semibold' },
  user:    { textCls: 'text-near-white',   prefix: '>',  fontWeight: '' },
  error:   { textCls: 'text-amber',        prefix: '',  fontWeight: '' },
}

interface Props {
  type: LineType
  text: string
  showCursor?: boolean
}

export function TerminalLine({ type, text, showCursor }: Props) {
  const cfg = LINE_CONFIG[type]

  return (
    <div className={`leading-[1.7] pl-3 lg:pl-4 xl:pl-5 mb-0.5 lg:mb-1 ${cfg.fontWeight}`}>
      {cfg.prefix && (
        <span className="text-matrix-green font-semibold mr-2">{cfg.prefix}</span>
      )}
      <span className={cfg.textCls}>
        {text}
        {showCursor && <span className="cursor-blink text-matrix-green">▌</span>}
      </span>
    </div>
  )
}
