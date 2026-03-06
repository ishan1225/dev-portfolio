import { DEFAULT_CONFIG, type MatrixDonutConfig } from './utils/matrixDonut'

interface Props {
  config: MatrixDonutConfig
  onChange: (config: MatrixDonutConfig) => void
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  disabled,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  format?: (v: number) => string
  onChange: (v: number) => void
  disabled?: boolean
}) {
  return (
    <div className="grid gap-1">
      <div className="flex justify-between gap-3">
        <span className="text-silver text-xs">{label}</span>
        <span className="text-warm-gray text-xs">{format ? format(value) : value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full"
      />
    </div>
  )
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-silver text-xs select-none">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
    </label>
  )
}

export function MatrixDonutDebug({ config, onChange }: Props) {
  const set = <K extends keyof MatrixDonutConfig>(key: K, value: MatrixDonutConfig[K]) =>
    onChange({ ...config, [key]: value })

  return (
    <div
      className="absolute top-3 right-3 w-64 bg-deep-space/90 backdrop-blur-sm border border-deep-teal rounded-lg p-3 z-10 font-mono grid gap-3 overflow-y-auto max-h-[calc(100%-24px)]"
      onClick={e => e.stopPropagation()}
    >
      <div className="text-mint-glow text-sm">Debug Controls</div>

      <Slider label="Donut size" value={config.donutScale} min={0.20} max={0.70} step={0.01} onChange={v => set('donutScale', v)} />
      <Slider label="Donut spin" value={config.donutSpin} min={0.10} max={3.00} step={0.05} format={v => `${v.toFixed(2)}×`} onChange={v => set('donutSpin', v)} />
      <Slider label="Rain speed" value={config.rainSpeed} min={0.10} max={3.50} step={0.05} format={v => `${v.toFixed(2)}×`} onChange={v => set('rainSpeed', v)} />
      <Slider label="FPS cap" value={config.fpsCap} min={10} max={60} step={1} format={v => `${v} fps`} onChange={v => set('fpsCap', v)} />

      <div className="h-px bg-deep-teal my-1" />

      <Checkbox label="Sticky head glyphs" checked={config.stickyHeads} onChange={v => set('stickyHeads', v)} />
      <Slider label="Head flicker" value={config.headFlickerHz} min={0.5} max={18} step={0.5} format={v => `${v.toFixed(1)} Hz`} onChange={v => set('headFlickerHz', v)} disabled={!config.stickyHeads} />
      <Slider label="Shimmer" value={config.shimmer} min={0} max={1} step={0.01} onChange={v => set('shimmer', v)} />
      <Slider label="Near → white" value={config.nearMixToWhite} min={0} max={1} step={0.01} onChange={v => set('nearMixToWhite', v)} />
      <Slider label="Trail length" value={config.trailLen} min={4} max={30} step={1} format={v => `${v}`} onChange={v => set('trailLen', v)} />
      <Checkbox label="Head glow" checked={config.headGlow} onChange={v => set('headGlow', v)} />

      <div className="h-px bg-deep-teal my-1" />

      <div className="grid gap-2">
        <div className="flex justify-between items-center">
          <span className="text-silver text-xs">Matrix color</span>
          <input
            type="color"
            value={config.matrixColor}
            onChange={e => set('matrixColor', e.target.value)}
            className="w-11 h-7 bg-transparent border-none cursor-pointer"
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-silver text-xs">Donut color</span>
          <input
            type="color"
            value={config.donutColor}
            onChange={e => set('donutColor', e.target.value)}
            className="w-11 h-7 bg-transparent border-none cursor-pointer"
          />
        </div>
      </div>

      <button
        className="mt-1 px-3 py-1.5 text-xs text-matrix-green border border-matrix-green/40 rounded hover:bg-matrix-green/10 transition-colors"
        onClick={() => onChange({ ...DEFAULT_CONFIG })}
      >
        Reset Defaults
      </button>
    </div>
  )
}
