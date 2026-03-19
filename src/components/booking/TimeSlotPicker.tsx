/**
 * Time slot grid with conflict-aware blocking.
 *
 * Visual states:
 *  - available   → selectable
 *  - selected    → pink highlight
 *  - blocked     → gray + strikethrough + tooltip with reason
 *  - would-block → amber tint — slots that WOULD be occupied by the
 *                  selected services if this start time is chosen
 */
import { useMemo } from 'react'
import { cn } from '../../lib/utils'
import { timeToMinutes, minutesToTime, type BlockedSlot } from '../../lib/schedule.utils'

interface TimeSlotPickerProps {
  /** Slots already filtered by working hours for the selected services */
  availableSlots: string[]
  selectedTime: string
  blockedSlots: Map<string, BlockedSlot>
  totalDurationMinutes: number
  onSelect: (time: string) => void
  error?: string
}

export function TimeSlotPicker({
  availableSlots,
  selectedTime,
  blockedSlots,
  totalDurationMinutes,
  onSelect,
  error,
}: TimeSlotPickerProps) {
  // Preview: which slots would be occupied if the hovered/selected start time is used
  const occupiedBySelection = useMemo(() => {
    if (!selectedTime || totalDurationMinutes === 0) return new Set<string>()
    const start = timeToMinutes(selectedTime)
    const occupied = new Set<string>()
    for (let t = start + 30; t < start + totalDurationMinutes; t += 30) {
      occupied.add(minutesToTime(t))
    }
    return occupied
  }, [selectedTime, totalDurationMinutes])

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
        {availableSlots.map((slot) => {
          const isSelected  = selectedTime === slot
          const blockInfo   = blockedSlots.get(slot)
          const isBlocked   = !!blockInfo
          const isOccupied  = occupiedBySelection.has(slot)

          return (
            <SlotButton
              key={slot}
              slot={slot}
              isSelected={isSelected}
              isBlocked={isBlocked}
              isOccupied={isOccupied}
              blockReason={blockInfo?.reason}
              onSelect={onSelect}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 pt-1">
        <LegendItem color="bg-pink-500" label="Selecionado" />
        <LegendItem color="bg-amber-200" label="Será ocupado" />
        <LegendItem color="bg-gray-200" label="Indisponível" />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ── Internal components ──────────────────────────────────────────────────────

interface SlotButtonProps {
  slot: string
  isSelected: boolean
  isBlocked: boolean
  isOccupied: boolean
  blockReason?: string
  onSelect: (time: string) => void
}

function SlotButton({ slot, isSelected, isBlocked, isOccupied, blockReason, onSelect }: SlotButtonProps) {
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
          isSelected  && 'border-pink-500 bg-pink-500 text-white font-semibold',
          isOccupied  && !isSelected && 'border-amber-300 bg-amber-50 text-amber-700',
          isBlocked   && 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through',
          !isSelected && !isBlocked && !isOccupied && 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50 cursor-pointer',
        )}
      >
        {slot}
      </button>

      {/* Tooltip for blocked slots */}
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

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`inline-block w-3 h-3 rounded-sm ${color}`} />
      {label}
    </span>
  )
}
