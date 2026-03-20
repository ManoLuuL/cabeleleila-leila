import { Label } from "../../../../components/ui";
import type { AuthFieldProps } from "./types";

export const Field = (props: AuthFieldProps) => {
    const {children,label,error} = props


  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}