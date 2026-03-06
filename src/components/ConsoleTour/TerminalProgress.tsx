import { AnimatePresence, motion } from 'framer-motion'
import { STEPS } from './data/steps'

interface Props {
  progress: number    // 0–1
  label: string       // e.g. "Boot" or "Tour"
  isBooting: boolean
  currentStep: number // 0-based, -1 if no step selected
  totalSteps: number  // visibleTotal (includes easter egg slot when revealed)
  easterEggRevealed: boolean
  easterEggPhase: 'none' | 'secret' | 'fun' | 'done'
  isComplete: boolean
  shouldPulse: boolean
  tutorialStep: number | null // null=inactive, 0=continue, 1=tab+enter, 2=click-about
  onTabClick: (index: number) => void
  onPlayClick: () => void
}

export function TerminalProgress({
  progress, label, isBooting, currentStep,
  easterEggRevealed, easterEggPhase, isComplete, shouldPulse,
  tutorialStep, onTabClick, onPlayClick,
}: Props) {
  // During tutorial: tabs disabled except step 2 (only About enabled)
  const isTabDisabled = (i: number) => {
    if (isBooting) return true
    if (tutorialStep === 0 || tutorialStep === 1) return true
    if (tutorialStep === 2) return i !== 0 // only About (index 0) enabled
    return false
  }

  const atEasterEgg = easterEggPhase === 'secret' || easterEggPhase === 'done'

  // Continue button: always visible, greyed out when not actionable
  const continueDisabled = isBooting || isComplete || tutorialStep === 1 || tutorialStep === 2

  return (
    <div className="px-3.5 lg:px-5 xl:px-6 pt-2 lg:pt-2.5 xl:pt-3 pb-1.5 lg:pb-2 xl:pb-2.5 border-b border-deep-teal">

      {/* Progress bar + label */}
      <div className="flex items-center gap-2.5 lg:gap-3 mb-1.5 lg:mb-2">
        <div className="flex-1 h-1 lg:h-1.5 bg-deep-teal rounded-sm overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-matrix-green to-mint-glow rounded-sm transition-[width] duration-300 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="text-warm-gray text-[11px] lg:text-xs xl:text-[13px] whitespace-nowrap">{label}</span>
      </div>

      {/* Step tabs + [???] + [▸] */}
      <div className="flex gap-1 lg:gap-1.5 flex-wrap items-center" data-onboard="tabs">
        {STEPS.map((step, i) => {
          const disabled = isTabDisabled(i)
          const isActive = !isBooting && i === currentStep && !atEasterEgg
          return (
            <button
              key={step.id}
              disabled={disabled}
              onClick={() => !disabled && onTabClick(i)}
              {...(i === 0 ? { 'data-onboard': 'tab-about' } : {})}
              className={[
                'px-2 lg:px-2.5 xl:px-3 py-[3px] lg:py-1 rounded-[3px] text-[11px] lg:text-xs xl:text-[13px] font-semibold border-0 font-mono transition-all duration-300',
                disabled
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

        {/* First bonus tab — ??? → Donut */}
        <AnimatePresence>
          {easterEggRevealed && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
              disabled={easterEggPhase === 'none'}
              onClick={() => easterEggPhase !== 'none' && onTabClick(STEPS.length)}
              className={[
                'px-2 lg:px-2.5 xl:px-3 py-[3px] lg:py-1 rounded-[3px] text-[11px] lg:text-xs xl:text-[13px] font-semibold border-0 font-mono transition-all duration-300',
                easterEggPhase === 'secret'
                  ? 'bg-matrix-green text-deep-space cursor-pointer'
                  : easterEggPhase === 'done'
                    ? 'bg-deep-teal/50 text-silver cursor-pointer hover:text-near-white'
                    : 'bg-deep-teal/50 text-amber tab-pulse cursor-default',
              ].join(' ')}
            >
              {easterEggPhase === 'none' ? '???' : 'Donut'}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Second bonus tab — ??? → Robo Hop */}
        <AnimatePresence>
          {(easterEggPhase === 'secret' || easterEggPhase === 'done') && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
              disabled={easterEggPhase !== 'done'}
              onClick={() => easterEggPhase === 'done' && onTabClick(STEPS.length + 1)}
              className={[
                'px-2 lg:px-2.5 xl:px-3 py-[3px] lg:py-1 rounded-[3px] text-[11px] lg:text-xs xl:text-[13px] font-semibold border-0 font-mono transition-all duration-300',
                easterEggPhase === 'done'
                  ? 'bg-matrix-green text-deep-space cursor-pointer'
                  : 'bg-deep-teal/50 text-amber tab-pulse cursor-default',
              ].join(' ')}
            >
              {easterEggPhase === 'done' ? 'Robo Hop' : '???'}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Continue button — always visible, greyed when disabled */}
        <button
          data-onboard="continue"
          disabled={continueDisabled}
          onClick={() => !continueDisabled && onPlayClick()}
          className={[
            'px-2.5 lg:px-3 xl:px-3.5 py-[3px] lg:py-1 rounded-[3px] text-[11px] lg:text-xs xl:text-[13px] font-bold border-0 font-mono transition-all duration-300',
            continueDisabled
              ? 'bg-deep-teal/50 text-muted-purple opacity-40 cursor-default'
              : 'bg-matrix-green/15 text-matrix-green hover:text-mint-glow hover:bg-matrix-green/25 cursor-pointer',
            !continueDisabled && (shouldPulse || tutorialStep === 0) ? 'play-pulse' : !continueDisabled ? 'btn-glow' : '',
          ].join(' ')}
        >
          Continue ▸
        </button>
      </div>

    </div>
  )
}
