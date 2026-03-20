import type { BlockedSlot } from "../../../lib/schedule.utils"

export type TimeSlotPickerProps = {
   availableSlots: string[]
  selectedTime: string
  blockedSlots: Map<string, BlockedSlot>
  totalDurationMinutes: number
  onSelect: (time: string) => void
  error?: string
}