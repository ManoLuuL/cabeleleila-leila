import { ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from '../ui'
import type { ToastMessage } from '../../types'

type ToastRendererProps = {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export const ToastRenderer = ({ toasts, onDismiss }: ToastRendererProps) => {
  return (
    <>
      <ToastViewport />
      {toasts.map((t) => (
        <Toast key={t.id} variant={t.variant} open>
          <div>
            <ToastTitle>{t.title}</ToastTitle>
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
          </div>
          <ToastClose onClick={() => onDismiss(t.id)} />
        </Toast>
      ))}
    </>
  )
}
