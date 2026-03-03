import { STEPS } from './data/steps'
import type { Mode } from './types'

interface Props {
  progress: number  // 0–1
  mode: Mode
  currentStep: number  // 0–4
  label: string  // e.g. "BOOT" or "1/5"
  onTabClick?: (index: number) => void
}

export function TerminalProgress({ progress, mode, currentStep, label, onTabClick }: Props) {
  const isBooting = mode === 'boot'

  return (
    <div className="px-3.5 lg:px-5 xl:px-6 pt-2 lg:pt-2.5 xl:pt-3 pb-1.5 lg:pb-2 xl:pb-2.5 border-b border-deep-teal">

      {/* Progress bar + label */}
      <div className="flex items-center gap-2.5 lg:gap-3 mb-1.5 lg:mb-2">
        <div className="flex-1 h-1 lg:h-1.5 bg-deep-teal rounded-sm overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-matrix-green to-mint-glow rounded-sm transition-[width] duration-100 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="text-warm-gray text-[11px] lg:text-xs xl:text-[13px] whitespace-nowrap">{label}</span>
      </div>

      {/* Step tabs */}
      <div className="flex gap-1 lg:gap-1.5 flex-wrap">
        {STEPS.map((step, i) => {
          const isActive = !isBooting && i === currentStep
          return (
            <button
              key={step.id}
              disabled={isBooting}
              onClick={() => !isBooting && onTabClick?.(i)}
              className={[
                'px-2 lg:px-2.5 xl:px-3 py-[3px] lg:py-1 rounded-[3px] text-[11px] lg:text-xs xl:text-[13px] font-semibold border-0 font-mono transition-all duration-300',
                isBooting
                  ? 'bg-deep-teal/50 text-muted-purple opacity-40 cursor-default'
                  : isActive
                    ? 'bg-matrix-green text-deep-space cursor-pointer'
                    : 'bg-deep-teal/50 text-silver cursor-pointer hover:text-near-white',
              ].join(' ')}
            >
              {step.tabLabel}
            </button>
          )
        })}
      </div>

    </div>
  )
}
