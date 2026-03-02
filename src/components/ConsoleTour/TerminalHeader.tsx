import type { Mode } from './types'

interface Props {
  mode: Mode
  onClose: () => void
}

export function TerminalHeader({ mode, onClose }: Props) {
  const isBooting = mode === 'boot'

  return (
    <div className="bg-deep-teal/40 border-b border-deep-teal px-3.5 lg:px-5 xl:px-6 py-2 lg:py-2.5 xl:py-3 flex items-center gap-2.5 lg:gap-3 xl:gap-3.5">
      <span className="text-mint-glow font-bold text-base lg:text-lg xl:text-xl tracking-[2px] flex-1">
        CONSOLE TOUR
      </span>

      <span
        className={`text-[11px] lg:text-xs xl:text-[13px] font-bold tracking-[1px] px-[7px] lg:px-2 xl:px-2.5 py-0.5 lg:py-1 rounded-[3px] ${
          isBooting ? 'bg-warm-gray text-deep-space' : 'bg-matrix-green text-deep-space'
        }`}
      >
        {isBooting ? 'BOOTING' : 'GUIDED'}
      </span>

      <button
        onClick={onClose}
        className="bg-transparent border-0 text-warm-gray text-base lg:text-lg xl:text-xl font-bold cursor-pointer px-0.5 leading-none hover:text-near-white transition-colors outline-none"
      >
        ×
      </button>
    </div>
  )
}
