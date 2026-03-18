/**
 * Purely presentational form component.
 * All logic is delegated to useBookingForm hook.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { CalendarIcon, AlertCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { ServiceSelector } from './ServiceSelector'
import type { Appointment } from '../../types'
import { useBookingForm } from '../../hooks/use-booking-form.hook'
import { formatShortDate } from '../../lib/date.utils'
import { TIME_SLOTS } from '../../lib/constants'

interface BookingFormProps {
  initialData?: Appointment
  onSuccess: (appointment: Appointment) => void
}

export function BookingForm({ initialData, onSuccess }: BookingFormProps) {
  const {
    form,
    step,
    setStep,
    selectedServices,
    setSelectedServices,
    selectedDate,
    watchedTime,
    minDate,
    sameWeekSuggestionDate,
    isSubmitting,
    isEditing,
    handleDateSelect,
    applySuggestedDate,
    handleSubmit,
  } = useBookingForm({ initialData, onSuccess })

  const { register, formState: { errors } } = form

  const slideVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step indicator */}
      <div className="flex gap-1">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-1 flex-1 rounded-full transition-colors ${
              step >= n ? 'bg-pink-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Step 1: Client data ── */}
        {step === 1 && (
          <motion.div
            key="step-1"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-4"
          >
            <StepLabel step={1} label="Seus dados" />

            <FormField label="Nome completo" error={errors.clientName?.message}>
              <Input id="clientName" placeholder="Seu nome" {...register('clientName')} />
            </FormField>

            <FormField label="Telefone / WhatsApp" error={errors.clientPhone?.message}>
              <Input id="clientPhone" placeholder="(11) 99999-9999" {...register('clientPhone')} />
            </FormField>

            <FormField label="E-mail" error={errors.clientEmail?.message}>
              <Input id="clientEmail" type="email" placeholder="seu@email.com" {...register('clientEmail')} />
            </FormField>

            <Button type="button" className="w-full" onClick={() => setStep(2)}>
              Próximo
            </Button>
          </motion.div>
        )}

        {/* ── Step 2: Services ── */}
        {step === 2 && (
          <motion.div
            key="step-2"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-4"
          >
            <StepLabel step={2} label="Serviços" />
            <ServiceSelector selected={selectedServices} onChange={setSelectedServices} />
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={selectedServices.length === 0}
                onClick={() => setStep(3)}
              >
                Próximo
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Date & time ── */}
        {step === 3 && (
          <motion.div
            key="step-3"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-4"
          >
            <StepLabel step={3} label="Data e horário" />

            <AnimatePresence>
              {sameWeekSuggestionDate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2"
                >
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex-1 text-sm text-amber-800">
                    <p className="font-medium">Você já tem agendamento nessa semana!</p>
                    <p className="text-xs mt-0.5">
                      Que tal agendar na mesma data ({formatShortDate(sameWeekSuggestionDate)}) para facilitar?
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-2 border-amber-400 text-amber-700 hover:bg-amber-100"
                      onClick={applySuggestedDate}
                    >
                      Usar essa data
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-center">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={{ before: minDate }}
                locale={ptBR}
                className="rdp-custom"
              />
            </div>

            {selectedDate && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                <Label className="flex items-center gap-1">
                  <CalendarIcon className="h-3.5 w-3.5 text-pink-500" />
                  Horário — {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </Label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                  {TIME_SLOTS.map((slot) => (
                    <label
                      key={slot}
                      className={`cursor-pointer text-center text-xs py-1.5 rounded-md border-2 transition-colors ${
                        watchedTime === slot
                          ? 'border-pink-500 bg-pink-50 text-pink-700 font-semibold'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <input
                        type="radio"
                        value={slot}
                        className="sr-only"
                        {...register('time')}
                      />
                      {slot}
                    </label>
                  ))}
                </div>
                {errors.time && <p className="text-xs text-red-500">Selecione um horário</p>}
              </motion.div>
            )}

            <FormField label="Observações (opcional)">
              <Input id="notes" placeholder="Alguma observação?" {...register('notes')} />
            </FormField>

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
                Voltar
              </Button>
              <Button type="submit" className="flex-1" disabled={!selectedDate || isSubmitting}>
                {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Confirmar agendamento'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}

// ── Internal sub-components ──────────────────────────────────────────────────

function StepLabel({ step, label }: { step: number; label: string }) {
  return (
    <p className="text-sm font-medium text-pink-700 uppercase tracking-wide">
      Passo {step} — {label}
    </p>
  )
}

function FormField({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
