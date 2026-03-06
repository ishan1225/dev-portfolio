import { STEPS } from './config/steps'
import { EASTER_EGGS } from './config/flow'

interface Props {
  progress: number    // 0–1
  label: string       // e.g. "Boot" or "Tour"
  isBooting: boolean
  currentStep: number // 0-based, -1 if no step selected
  easterEggRevealed: boolean
  easterEggPhase: 'none' | 'secret' | 'fun' | 'done'
  isComplete: boolean
  matrixMode: boolean
  gameMode: boolean
  tutorialStep: number | null // null=inactive, 0=continue, 1=tab+enter, 2=click-about
  onTabClick: (index: number) => void
  onPlayClick: () => void
}

export function TerminalProgress({
  progress, label, isBooting, currentStep,
  easterEggRevealed, easterEggPhase, isComplete,
  matrixMode, gameMode,
  tutorialStep, onTabClick, onPlayClick,
}: Props) {
  // During tutorial: tabs disabled except step 2 (only About enabled)
  const isTabDisabled = (i: number) => {
    if (isBooting) return true
    if (tutorialStep === 0 || tutorialStep === 1 || tutorialStep === 3) return true
    if (tutorialStep === 2) return i !== 0 // only About (index 0) enabled
    return false
  }

  const inBonusMode = matrixMode || gameMode

  // Continue button: always visible, greyed out when not actionable
  const continueDisabled = isBooting || isComplete || tutorialStep === 1 || tutorialStep === 2 || tutorialStep === 3

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
          const isActive = !isBooting && i === currentStep && !inBonusMode
          return (
            <button
              key={step.id}
              disabled={disabled}
              onClick={() => !disabled && onTabClick(i)}
              {...(i === 0 ? { 'data-onboard': 'tab-first' } : {})}
              className={[
                'px-2 lg:px-2.5 xl:px-3 py-[3px] lg:py-1 rounded-[3px] text-[11px] lg:text-xs xl:text-[13px] font-semibold border-0 font-mono transition-all duration-300',
                disabled
                  ? 'bg-deep-teal/50 text-muted-purple opacity-40 cursor-default'
                  : tutorialStep === 2 && i === 0
                    ? 'bg-matrix-green/15 text-matrix-green cursor-pointer tab-pulse-loop'
                    : isActive
                      ? 'bg-matrix-green text-deep-space cursor-pointer'
                      : 'bg-deep-teal/50 text-silver cursor-pointer hover:text-near-white',
              ].join(' ')}
            >
              {step.tabLabel}
            </button>
          )
        })}

        {/* Bonus tab 1 — ??? → Donut (always rendered, locked until easterEggRevealed) */}
        {(() => {
          const unlocked = easterEggRevealed
          const revealed = easterEggPhase !== 'none' // typed "secret" at least once
          const label = revealed ? EASTER_EGGS.secret.tabLabel : EASTER_EGGS.secret.unrevealedLabel
          return (
            <button
              onClick={() => onTabClick(STEPS.length)}
              style={{ minWidth: `${EASTER_EGGS.secret.tabLabel.length + 2}ch` }}
              className={[
                'px-2 lg:px-2.5 xl:px-3 py-[3px] lg:py-1 rounded-[3px] text-[11px] lg:text-xs xl:text-[13px] font-semibold border-0 font-mono transition-all duration-300',
                !unlocked
                  ? 'bg-deep-teal/50 text-muted-purple opacity-40 cursor-pointer'
                  : revealed
                    ? matrixMode
                      ? 'bg-matrix-green text-deep-space cursor-pointer'
                      : 'bg-deep-teal/50 text-silver cursor-pointer hover:text-near-white'
                    : 'bg-deep-teal/50 text-amber tab-pulse cursor-pointer',
              ].join(' ')}
            >
              {label}
            </button>
          )
        })()}

        {/* Bonus tab 2 — ??? → Robo Hop (always rendered, locked until secret phase) */}
        {(() => {
          const unlocked = easterEggPhase === 'secret' || easterEggPhase === 'done'
          const revealed = easterEggPhase === 'done' // typed "fun" at least once
          const label = revealed ? EASTER_EGGS.fun.tabLabel : EASTER_EGGS.fun.unrevealedLabel
          return (
            <button
              onClick={() => onTabClick(STEPS.length + 1)}
              style={{ minWidth: `${EASTER_EGGS.fun.tabLabel.length + 2}ch` }}
              className={[
                'px-2 lg:px-2.5 xl:px-3 py-[3px] lg:py-1 rounded-[3px] text-[11px] lg:text-xs xl:text-[13px] font-semibold border-0 font-mono transition-all duration-300',
                !unlocked
                  ? 'bg-deep-teal/50 text-muted-purple opacity-40 cursor-pointer'
                  : revealed
                    ? gameMode
                      ? 'bg-matrix-green text-deep-space cursor-pointer'
                      : 'bg-deep-teal/50 text-silver cursor-pointer hover:text-near-white'
                    : 'bg-deep-teal/50 text-amber tab-pulse cursor-pointer',
              ].join(' ')}
            >
              {label}
            </button>
          )
        })()}

        {/* Continue button — always visible, greyed when disabled */}
        <button
          data-onboard="continue"
          disabled={continueDisabled}
          onClick={() => !continueDisabled && onPlayClick()}
          className={[
            'px-2 lg:px-2.5 xl:px-3 py-[3px] lg:py-1 rounded-[3px] text-[11px] lg:text-xs xl:text-[13px] font-semibold border-0 font-mono transition-all duration-300',
            continueDisabled
              ? 'bg-deep-teal/50 text-muted-purple opacity-40 cursor-default'
              : tutorialStep === 0
                ? 'bg-matrix-green/15 text-matrix-green cursor-pointer tab-pulse-loop'
                : 'bg-deep-teal/50 text-silver cursor-pointer hover:text-near-white',
          ].join(' ')}
        >
          Continue ▸
        </button>
      </div>

    </div>
  )
}
