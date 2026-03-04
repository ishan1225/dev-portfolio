import { AnimatePresence, motion } from 'framer-motion'
import { STEPS } from './data/steps'

interface Props {
  progress: number    // 0–1
  label: string       // e.g. "BOOT" or "2/5"
  isBooting: boolean
  currentStep: number // 0-based, -1 if no step selected
  totalSteps: number  // visibleTotal (includes easter egg slot when revealed)
  easterEggRevealed: boolean
  isComplete: boolean
  shouldPulse: boolean
  onTabClick: (index: number) => void
  onPlayClick: () => void
}

export function TerminalProgress({
  progress, label, isBooting, currentStep,
  easterEggRevealed, isComplete, shouldPulse,
  onTabClick, onPlayClick,
}: Props) {
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

      {/* Step tabs + [???] + [▸] */}
      <div className="flex gap-1 lg:gap-1.5 flex-wrap items-center">
        {STEPS.map((step, i) => {
          const isActive = !isBooting && i === currentStep
          return (
            <button
              key={step.id}
              disabled={isBooting}
              onClick={() => !isBooting && onTabClick(i)}
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

        {/* [???] easter egg tab — fades in after contact */}
        <AnimatePresence>
          {easterEggRevealed && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
              className="px-2 lg:px-2.5 xl:px-3 py-[3px] lg:py-1 rounded-[3px] text-[11px] lg:text-xs xl:text-[13px] font-semibold font-mono bg-deep-teal/50 text-amber tab-pulse"
            >
              ???
            </motion.span>
          )}
        </AnimatePresence>

        {/* [▸] play button — hides when tour complete */}
        {!isBooting && !isComplete && (
          <button
            onClick={onPlayClick}
            className={[
              'px-2 lg:px-2.5 py-[3px] lg:py-1 rounded-[3px] text-[11px] lg:text-xs xl:text-[13px] font-bold border-0 font-mono cursor-pointer transition-all duration-300',
              'bg-deep-teal/50 text-matrix-green hover:text-mint-glow hover:bg-deep-teal/80',
              shouldPulse ? 'play-pulse' : '',
            ].join(' ')}
          >
            ▸
          </button>
        )}
      </div>

    </div>
  )
}
