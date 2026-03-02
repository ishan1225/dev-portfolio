import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ConsoleTour } from '../components/ConsoleTour/ConsoleTour'

export function Landing() {
  const [isOpen, setIsOpen] = useState(false)
  const handleClose = useCallback(() => setIsOpen(false), [])

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center font-mono">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="text-warm-gray text-[13px] lg:text-sm xl:text-base tracking-[2px] mb-8"
      >
        DEVELOPER · PORTFOLIO
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(true)}
        className="bg-transparent border border-matrix-green text-matrix-green font-mono text-sm lg:text-base xl:text-lg font-semibold tracking-[1px] px-7 lg:px-9 py-3 lg:py-3.5 rounded-md cursor-pointer hover:bg-matrix-green/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-matrix-green/60 focus-visible:ring-offset-2 focus-visible:ring-offset-void"
      >
        enter console
      </motion.button>

      <ConsoleTour isOpen={isOpen} onClose={handleClose} />
    </div>
  )
}
