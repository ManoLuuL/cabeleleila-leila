import { cn } from "../../../../../lib/utils"
import type { SlotButtonProps } from "./types"

export const SlotButton = (props: SlotButtonProps) => {
    const { slot, isSelected, isBlocked, isOccupied, blockReason, onSelect } = props

  const title = isBlocked
    ? `Ocupado — ${blockReason}`
    : isOccupied
      ? 'Será ocupado pelo seu atendimento'
      : slot

  return (
    <div className="relative group">
      <button
        type="button"
        disabled={isBlocked}
        onClick={() => !isBlocked && onSelect(slot)}
        title={title}
        className={cn(
          'w-full text-center text-xs py-1.5 rounded-md border-2 transition-all',
          isSelected && 'border-pink-500 bg-pink-500 text-white font-semibold',
          isOccupied && !isSelected && 'border-amber-300 bg-amber-50 text-amber-700',
          isBlocked && 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through',
          !isSelected && !isBlocked && !isOccupied && 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50 cursor-pointer',
        )}
      >
        {slot}
      </button>

   
      {isBlocked && blockReason && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-10 hidden group-hover:block">
          <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
            {blockReason}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
          </div>
        </div>
      )}
    </div>
  )
}