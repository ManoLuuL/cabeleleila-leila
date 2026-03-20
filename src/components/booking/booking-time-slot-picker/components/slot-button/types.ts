export type SlotButtonProps = {
  slot: string
  isSelected: boolean
  isBlocked: boolean
  isOccupied: boolean
  blockReason?: string
  onSelect: (time: string) => void
}