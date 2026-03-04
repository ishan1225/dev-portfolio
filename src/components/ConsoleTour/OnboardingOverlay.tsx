import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TIMING } from './constants'

interface Props {
  step: number // 0=continue, 1=tab+enter, 2=click-about, 3=farewell
}

const STEP_CONFIG: Array<{
  selector: string
  arrow: string
  message: React.ReactNode
  position: 'below-right' | 'above-left' | 'below-left'
}> = [
  {
    selector: '[data-onboard="continue"]',
    arrow: 'callout-arrow-up-right',
    message: <>press <span className="text-matrix-green">Continue ▸</span> to advance</>,
    position: 'below-right',
  },
  {
    selector: '[data-onboard="input"]',
    arrow: 'callout-arrow-down',
    message: <>press <span className="text-matrix-green">TAB</span> to fill, then <span className="text-matrix-green">ENTER</span></>,
    position: 'above-left',
  },
  {
    selector: '[data-onboard="tab-about"]',
    arrow: 'callout-arrow-up',
    message: <>click <span className="text-matrix-green">About</span> to jump there</>,
    position: 'below-left',
  },
]

/**
 * Tutorial overlay. Steps 0-2: centered title + single callout.
 * Step 3: farewell message that fades out.
 *
 * On first mount, the intro is sequenced:
 *   700ms → title fades in (after boot text has cleared)
 *   1500ms → callout fades in
 * Subsequent step changes swap the callout immediately.
 */
export function OnboardingOverlay({ step }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<Record<string, number> | null>(null)

  // Intro sequencing — only on first mount (no ref guard — breaks StrictMode)
  const [titleVisible, setTitleVisible] = useState(false)
  const [calloutVisible, setCalloutVisible] = useState(false)

  useEffect(() => {
    const titleTimer = setTimeout(() => setTitleVisible(true), TIMING.onboardingDelayMs + 100)
    const calloutTimer = setTimeout(() => setCalloutVisible(true), TIMING.onboardingDelayMs + 900)

    return () => {
      clearTimeout(titleTimer)
      clearTimeout(calloutTimer)
    }
  }, [])

  const config = step < 3 ? STEP_CONFIG[step] : null

  // Measure target element position relative to overlay
  useEffect(() => {
    if (!config || !calloutVisible) return
    setPos(null)

    const raf = requestAnimationFrame(() => {
      const el = overlayRef.current
      if (!el) return
      const cr = el.getBoundingClientRect()

      const target = document.querySelector(config.selector)
      if (!target) return
      const tr = target.getBoundingClientRect()

      if (config.position === 'below-right') {
        setPos({ top: tr.bottom - cr.top + 8, right: cr.right - tr.right })
      } else if (config.position === 'above-left') {
        setPos({ bottom: cr.bottom - tr.top + 8, left: tr.left - cr.left })
      } else {
        setPos({ top: tr.bottom - cr.top + 8, left: tr.left - cr.left })
      }
    })

    return () => cancelAnimationFrame(raf)
  }, [step, config, calloutVisible])

  const isFarewell = step === 3

  return (
    <motion.div
      ref={overlayRef}
      className="absolute inset-0 z-10 pointer-events-none"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Centered title (steps 0-2) or farewell (step 3) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {(titleVisible || isFarewell) && (
            <motion.div
              key={isFarewell ? 'farewell' : 'title'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center px-6"
            >
              {isFarewell ? (
                <span className="text-matrix-green text-sm lg:text-base font-mono">
                  you're all set — navigate however you like.
                </span>
              ) : (
                <span className="text-silver text-base lg:text-lg font-mono font-semibold">
                  3 ways to navigate
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Callout — steps 0-2 only, after intro sequence completes */}
      <AnimatePresence mode="wait">
        {calloutVisible && config && pos && (
          <motion.div
            key={step}
            className={`absolute ${config.arrow}`}
            style={pos}
            initial={{ opacity: 0, y: config.position === 'above-left' ? 6 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-deep-teal border border-matrix-green/30 rounded-md px-3 py-2">
              <p className="text-silver text-xs lg:text-sm font-mono">
                {config.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
