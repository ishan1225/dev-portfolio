import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  step: number // 0=continue, 1=tab+enter, 2=click-about
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
    selector: '[data-onboard="tab-first"]',
    arrow: 'callout-arrow-up',
    message: <>click <span className="text-matrix-green">About</span> to jump there</>,
    position: 'below-left',
  },
]

/**
 * Tutorial overlay. Steps 0-2: centered title + callout arrow.
 *
 * Title appears immediately. Callout fades in after title animation (0.8s delay).
 * Subsequent step changes swap the callout immediately.
 */
export function OnboardingOverlay({ step }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<Record<string, number> | null>(null)
  const isFirstMount = useRef(true)

  const config = STEP_CONFIG[step] ?? null

  // Measure target element position relative to overlay
  useEffect(() => {
    if (!config) return
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
  }, [step, config])

  // Track first mount for initial callout delay
  useEffect(() => {
    isFirstMount.current = false
  }, [])

  return (
    <motion.div
      ref={overlayRef}
      className="absolute inset-0 z-10 pointer-events-none"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Centered title */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center px-6"
        >
          <span className="text-silver text-base lg:text-lg font-mono font-semibold">
            3 ways to navigate
          </span>
        </motion.div>
      </div>

      {/* Callout arrow — steps 0-2 only */}
      <AnimatePresence mode="wait">
        {config && pos && (
          <motion.div
            key={step}
            className={`absolute ${config.arrow}`}
            style={pos}
            initial={{ opacity: 0, y: config.position === 'above-left' ? 6 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.3,
              delay: isFirstMount.current ? 0.8 : 0,
            }}
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
