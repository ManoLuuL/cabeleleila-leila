import { useMemo } from 'react'
import { timeToMinutes, minutesToTime } from '../../../lib/schedule.utils'
import type { TimeSlotPickerProps } from './types'
import { LegendItem } from './components/legend-item'
import { SlotButton } from './components/slot-button'


export const TimeSlotPicker = (props: TimeSlotPickerProps) => {

  const {
    availableSlots,
    selectedTime,
    blockedSlots,
    totalDurationMinutes,
    onSelect,
    error,
  } = props

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
          const isSelected = selectedTime === slot
          const blockInfo = blockedSlots.get(slot)
          const isBlocked = !!blockInfo
          const isOccupied = occupiedBySelection.has(slot)

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


      <div className="flex flex-wrap gap-3 text-xs text-gray-500 pt-1">
        <LegendItem color="bg-pink-500" label="Selecionado" />
        <LegendItem color="bg-amber-200" label="Será ocupado" />
        <LegendItem color="bg-gray-200" label="Indisponível" />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}





