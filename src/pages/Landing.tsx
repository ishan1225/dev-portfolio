import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ConsoleTour } from '../components/ConsoleTour/ConsoleTour'
import { C } from '../components/ConsoleTour/constants'
import {
  SKILL_GROUPS,
  PROJECTS,
  EXPERIENCE,
  CONTACT_EMAIL,
  SOCIAL_LINKS,
  LOCATION,
} from '../data/portfolio'

/* ── Scroll-direction-aware section reveal ── */

function useRevealOnScrollDown(threshold = 0.15) {
  const ref = useRef<HTMLElement | null>(null)
  const [revealed, setRevealed] = useState(false)
  const scrollingDown = useRef(true)
  const lastY = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el || revealed) return

    lastY.current = window.scrollY
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) {
      setRevealed(true)
      return
    }

    const onScroll = () => {
      const y = window.scrollY
      scrollingDown.current = y >= lastY.current
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && scrollingDown.current) setRevealed(true)
      },
      { threshold },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [threshold, revealed])

  return { ref, revealed }
}

/* ── Animation variants ── */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

/* ── Reusable components ── */

function RevealSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const { ref, revealed } = useRevealOnScrollDown()
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={revealed ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  )
}

function SectionHeader({ label, count, centered }: { label: string; count?: number; centered?: boolean }) {
  if (centered) {
    return (
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="flex-1 h-px bg-gradient-to-l from-deep-teal to-transparent" />
        <span className="text-xs sm:text-sm text-warm-gray tracking-[4px] font-semibold">{label}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-deep-teal to-transparent" />
      </div>
    )
  }
  return (
    <div className="flex items-center gap-3 mb-6 sm:mb-8">
      <span className="text-xs sm:text-sm text-warm-gray tracking-[4px] font-semibold shrink-0">{label}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-deep-teal to-transparent" />
      {count !== undefined && <span className="text-xs text-muted-purple">{count}</span>}
    </div>
  )
}

function Divider() {
  return <div className="bg-gradient-to-r from-transparent via-deep-teal to-transparent h-px" />
}

/* ═══════════════════════════════════════ */

export function Landing() {
  const [isOpen, setIsOpen] = useState(false)
  const handleClose = useCallback(() => setIsOpen(false), [])
  const [copied, setCopied] = useState(false)
  const [expandedProject, setExpandedProject] = useState<number | null>(null)
  const [expandedExp, setExpandedExp] = useState<number | null>(null)
  const [showAllProjects, setShowAllProjects] = useState(false)

  function handleCopyEmail() {
    navigator.clipboard.writeText(CONTACT_EMAIL).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-void font-mono">

      {/* ═══ Hero ═══ */}
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 sm:gap-4 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-deep-teal flex items-center justify-center text-xs text-warm-gray"
          style={{ background: `linear-gradient(135deg, ${C.deepSpace}, ${C.deepTeal}40)` }}
        >
          avatar
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-xl sm:text-3xl text-mint-glow font-bold tracking-[4px]"
        >
          YOUR NAME
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="text-xs sm:text-sm text-warm-gray tracking-[2px] sm:tracking-[3px]"
        >
          FULL-STACK DEVELOPER &middot; 5+ YEARS
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="flex items-center gap-1.5 mt-1"
        >
          <div
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-matrix-green"
            style={{ boxShadow: `0 0 6px ${C.matrixGreen}60` }}
          />
          <span className="text-[10px] sm:text-xs text-warm-gray tracking-[1.5px]">AVAILABLE</span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsOpen(true)}
          className="hidden sm:inline-flex mt-4 px-7 py-3 border border-matrix-green/40 rounded-md text-matrix-green text-sm font-semibold tracking-[1.5px] cursor-pointer hover:bg-matrix-green/10 transition-colors btn-glow"
        >
          enter console
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="hidden sm:block text-xs text-muted-purple mt-8 tracking-[3px]"
        >
          or scroll &darr;
        </motion.div>
      </div>

      <Divider />

      {/* ═══ About ═══ */}
      <RevealSection className="px-6 sm:px-8 py-16 sm:py-24 max-w-xl mx-auto">
        <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
          <SectionHeader label="ABOUT" />
        </motion.div>
        <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="text-sm sm:text-base text-silver leading-relaxed">
          I build performant web applications and developer tools. Focused on React ecosystems,
          cloud infrastructure, and clean architecture.
        </motion.p>
      </RevealSection>

      <Divider />

      {/* ═══ Skills ═══ */}
      <RevealSection className="px-6 sm:px-8 py-16 sm:py-24 max-w-xl mx-auto">
        <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
          <SectionHeader label="SKILLS" />
        </motion.div>
        <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="flex flex-col gap-4">
          {SKILL_GROUPS.map((g) => (
            <div key={g.label}>
              <div className="text-[10px] sm:text-xs text-teal-accent uppercase tracking-[3px] font-semibold mb-2">{g.label}</div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {g.items.map((s) => (
                  <span key={s} className="px-2.5 sm:px-3 py-1 rounded text-xs sm:text-sm border border-deep-teal/[0.38] bg-deep-teal/[0.19] text-silver">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </RevealSection>

      <Divider />

      {/* ═══ Featured Work ═══ */}
      <RevealSection className="px-6 sm:px-8 py-16 sm:py-24 max-w-xl mx-auto">
        <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
          <SectionHeader label="FEATURED WORK" count={PROJECTS.length} />
        </motion.div>

        {PROJECTS.map((p, i) => {
          if (i >= 4 && !showAllProjects) return null
          const expanded = expandedProject === i
          const isExtra = i >= 4

          const card = (
            <>
              <div
                onClick={() => setExpandedProject(expanded ? null : i)}
                className={`
                  py-4 sm:py-5 px-4 sm:px-5 cursor-pointer transition-all duration-200
                  border-l-[3px] rounded-lg
                  ${expanded ? 'border-l-matrix-green/25 bg-deep-teal/[0.13]' : 'border-l-transparent hover:bg-deep-teal/[0.06]'}
                `}
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <span className={`text-sm sm:text-base font-bold transition-colors duration-200 ${expanded ? 'text-bright-silver' : 'text-silver'}`}>
                    {p.title}
                  </span>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="text-[10px] sm:text-xs font-semibold text-amber bg-amber/[0.06] border border-amber/[0.07] px-2.5 py-0.5 rounded-xl">
                      {p.impactBadge}
                    </span>
                    <span className={`text-sm font-light transition-colors duration-200 ${expanded ? 'text-matrix-green' : 'text-muted-purple'}`}>
                      {expanded ? '\u2212' : '+'}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-warm-gray leading-relaxed">{p.desc}</p>

                <div className="flex gap-1.5 flex-wrap mt-2.5">
                  {p.tags.map((t) => (
                    <span key={t} className="px-2.5 sm:px-3 py-1 rounded text-xs sm:text-sm border border-deep-teal/[0.38] bg-deep-teal/[0.19] text-silver">
                      {t}
                    </span>
                  ))}
                </div>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-3 border-t border-deep-teal/20 pb-1">
                        {p.bullets.map((b, j) => (
                          <div key={j} className="flex gap-2 mb-1.5">
                            <span className="text-matrix-green text-xs sm:text-sm shrink-0 mt-0.5">&#x25B8;</span>
                            <span className="text-silver text-xs sm:text-sm leading-relaxed">{b}</span>
                          </div>
                        ))}

                        {p.impact.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-deep-teal/15">
                            <span className="text-[10px] sm:text-xs text-amber/70 tracking-[2px] font-semibold">IMPACT</span>
                            <div className="mt-1.5">
                              {p.impact.map((imp, j) => (
                                <div key={j} className="flex gap-2 mb-1.5">
                                  <span className="text-amber text-xs sm:text-sm shrink-0 mt-0.5">&#x25B8;</span>
                                  <span className="text-silver text-xs sm:text-sm leading-relaxed">{imp}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3 mt-4">
                          <a onClick={(e) => e.stopPropagation()} href="#" className="px-4 py-1.5 rounded-md border border-matrix-green/35 text-xs sm:text-sm text-matrix-green font-semibold tracking-[1px] hover:bg-matrix-green/15 hover:border-matrix-green/60 transition-all duration-200">
                            GitHub &#x2192;
                          </a>
                          <a onClick={(e) => e.stopPropagation()} href="#" className="px-4 py-1.5 rounded-md border border-matrix-green/35 text-xs sm:text-sm text-matrix-green font-semibold tracking-[1px] hover:bg-matrix-green/15 hover:border-matrix-green/60 transition-all duration-200">
                            Demo &#x2192;
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {i < PROJECTS.length - 1 && (
                <div className="h-px bg-deep-teal/[0.15] mx-4" />
              )}
            </>
          )

          return isExtra ? (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: (i - 4) * 0.1 }}
            >
              {card}
            </motion.div>
          ) : (
            <motion.div key={i} variants={fadeUp} transition={{ duration: 0.4 }}>
              {card}
            </motion.div>
          )
        })}

        {!showAllProjects && PROJECTS.length > 4 && (
          <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="text-center mt-4">
            <button
              onClick={() => setShowAllProjects(true)}
              className="text-xs sm:text-sm text-warm-gray hover:text-silver transition-colors cursor-pointer tracking-[1px]"
            >
              show {PROJECTS.length - 4} more &darr;
            </button>
          </motion.div>
        )}
      </RevealSection>

      <Divider />

      {/* ═══ Experience ═══ */}
      <RevealSection className="px-6 sm:px-8 py-16 sm:py-24 max-w-xl mx-auto">
        <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
          <SectionHeader label="EXPERIENCE" />
        </motion.div>

        {EXPERIENCE.map((e, i) => {
          const expanded = expandedExp === i
          return (
            <motion.div key={i} variants={fadeUp} transition={{ duration: 0.4 }}>
              <div
                onClick={() => setExpandedExp(expanded ? null : i)}
                className={`
                  py-3 sm:py-4 px-4 sm:px-5 cursor-pointer transition-all duration-200
                  border-l-[3px] rounded-md
                  ${expanded ? 'border-l-teal-accent bg-deep-teal/[0.09]' : 'border-l-transparent hover:bg-deep-teal/[0.06]'}
                `}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className={`text-sm sm:text-base font-semibold transition-colors duration-200 ${expanded ? 'text-bright-silver' : 'text-silver'}`}>
                      {e.role}
                    </span>
                    <span className="text-xs sm:text-sm text-warm-gray ml-2 sm:ml-3">{e.company}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="text-xs text-muted-purple">{e.year}</span>
                    <span className={`text-sm font-light transition-colors duration-200 ${expanded ? 'text-teal-accent' : 'text-muted-purple'}`}>
                      {expanded ? '\u2212' : '+'}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-warm-gray mt-1.5 leading-relaxed">{e.brief}</p>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3">
                        {e.details.map((d, j) => (
                          <div key={j} className="flex gap-2 mb-1.5">
                            <span className="text-teal-accent text-xs sm:text-sm shrink-0 mt-0.5">&#x25B8;</span>
                            <span className="text-silver text-xs sm:text-sm leading-relaxed">{d}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {i < EXPERIENCE.length - 1 && (
                <div className="h-px bg-deep-teal/[0.12] mx-4" />
              )}
            </motion.div>
          )
        })}
      </RevealSection>

      <Divider />

      {/* ═══ Contact ═══ */}
      <RevealSection className="px-6 sm:px-8 py-16 sm:py-24 max-w-xl mx-auto text-center pb-24 sm:pb-24">
        <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
          <SectionHeader label="CONTACT" centered />
        </motion.div>

        <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
          <div
            onClick={handleCopyEmail}
            className={`
              inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-6 py-2.5 sm:py-3 rounded-md
              border cursor-pointer transition-all duration-200
              ${copied ? 'border-matrix-green/50 bg-matrix-green/[0.03]' : 'border-deep-teal'}
            `}
          >
            <span className={`text-sm ${copied ? 'text-matrix-green' : 'text-silver'}`}>
              {copied ? 'copied!' : CONTACT_EMAIL}
            </span>
            <span className="hidden sm:inline text-xs text-muted-purple">
              {copied ? '\u2713' : 'click to copy'}
            </span>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="flex gap-5 sm:gap-6 justify-center mt-5 sm:mt-6">
          {SOCIAL_LINKS.map((l) => (
            <a key={l.label} href={l.href} className="text-xs sm:text-sm text-warm-gray cursor-pointer hover:text-silver transition-colors">
              {l.label}
            </a>
          ))}
        </motion.div>

        <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="text-xs text-muted-purple mt-4 sm:mt-5 tracking-[1.5px]">
          {LOCATION}
        </motion.p>
      </RevealSection>

      {/* ═══ Mobile sticky bottom bar ═══ */}
      <div className="fixed bottom-0 inset-x-0 px-3 pb-2 sm:hidden z-50">
        <div className="flex justify-around px-3 py-2.5 bg-void/92 backdrop-blur border border-deep-teal rounded-xl">
          {['email', 'github', 'linkedin', 'resume'].map((l) => (
            <span key={l} className="text-xs text-cyan tracking-[1.5px] cursor-pointer">{l}</span>
          ))}
        </div>
      </div>

      <ConsoleTour isOpen={isOpen} onClose={handleClose} />
    </div>
  )
}
