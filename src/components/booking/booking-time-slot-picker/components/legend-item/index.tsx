import type { LegendItemProps } from "./types"

export const LegendItem = ({ color, label }: LegendItemProps) => {
  return (
    <span className="flex items-center gap-1">
      <span className={`inline-block w-3 h-3 rounded-sm ${color}`} />
      {label}
    </span>
  )
}