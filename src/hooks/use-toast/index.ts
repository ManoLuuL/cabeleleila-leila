import { useState, useCallback } from 'react'
import type { ToastMessage } from '../../types'
import type { ShowToastOptions } from './types'

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback(({ title, description, variant = 'default' }: ShowToastOptions) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, title, description, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, showToast, dismissToast }
}
