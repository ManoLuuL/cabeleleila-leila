import type { Service } from "../../../types"

export type ServiceSelectorProps = {
  selected: Service[]
  onChange: (services: Service[]) => void
}