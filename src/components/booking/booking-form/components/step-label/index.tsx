import type { StepLabelProps } from "./types"

export const StepLabel = (props: StepLabelProps) =>{
    const { step, label } = props


  return (
    <p className="text-sm font-medium text-pink-700 uppercase tracking-wide">
      Passo {step} — {label}
    </p>
  )
}