import { motion, AnimatePresence } from 'framer-motion'
import { Check, Scissors } from 'lucide-react'
import type { ServiceSelectorProps } from './types'
import type { Service } from '../../../types'
import { formatCurrency, sumCents } from '../../../lib/currency.utils'
import { SALON_SERVICES } from '../../../lib/constants'
import { cn } from '../../../lib/utils'


export const ServiceSelector = (props: ServiceSelectorProps) => {
  const { selected, onChange } = props

  const toggle = (service: Service) => {
    const isSelected = selected.some((s) => s.name === service.name)
    onChange(isSelected ? selected.filter((s) => s.name !== service.name) : [...selected, service])
  }

  const totalCents    = sumCents(selected.map((s) => s.priceInCents))
  const totalDuration = selected.reduce((acc, s) => acc + s.durationMinutes, 0)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SALON_SERVICES.map((service) => {
          const isSelected = selected.some((s) => s.name === service.name)
          return (
            <motion.button
              key={service.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => toggle(service)}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border-2 text-left transition-colors',
                isSelected
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 bg-white hover:border-pink-300 hover:bg-pink-50/50',
              )}
            >
              <div className="flex items-center gap-2">
                <Scissors className={cn('h-4 w-4', isSelected ? 'text-pink-600' : 'text-gray-400')} />
                <div>
                  <p className={cn('text-sm font-medium', isSelected ? 'text-pink-700' : 'text-gray-700')}>
                    {service.name}
                  </p>
                  <p className="text-xs text-gray-400">{service.durationMinutes} min</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={cn('text-sm font-semibold', isSelected ? 'text-pink-700' : 'text-gray-600')}>
                  {formatCurrency(service.priceInCents)}
                </span>
                <div
                  className={cn(
                    'h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors',
                    isSelected ? 'border-pink-500 bg-pink-500' : 'border-gray-300',
                  )}
                >
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Check className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-pink-50 rounded-lg p-3 flex justify-between text-sm"
          >
            <span className="text-pink-700">
              {selected.length} serviço(s) · {totalDuration} min
            </span>
            <span className="font-semibold text-pink-700">{formatCurrency(totalCents)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
