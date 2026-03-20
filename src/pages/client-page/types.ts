import type { Appointment } from "../../types";

export type ModalState =
  | { type: 'closed' }
  | { type: 'booking'; editing?: Appointment }
  | { type: 'auth' }