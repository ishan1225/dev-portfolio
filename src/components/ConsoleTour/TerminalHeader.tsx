interface Props {
  onClose: () => void
}

export function TerminalHeader({ onClose }: Props) {
  return (
    <div className="bg-deep-teal/40 border-b border-deep-teal px-3.5 lg:px-5 xl:px-6 py-2 lg:py-2.5 xl:py-3 flex items-center gap-2.5 lg:gap-3 xl:gap-3.5">
      <span className="text-mint-glow font-bold text-base lg:text-lg xl:text-xl tracking-[2px] flex-1">
        CONSOLE TOUR
      </span>

      <button
        onClick={onClose}
        className="bg-transparent border-0 text-warm-gray text-base lg:text-lg xl:text-xl font-bold cursor-pointer px-0.5 leading-none hover:text-near-white transition-colors outline-none"
      >
        x
      </button>
    </div>
  )
}
