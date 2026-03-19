/**
 * Purely presentational form component.
 * All logic is delegated to useBookingForm hook.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { CalendarIcon, AlertCircle, User } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { ServiceSelector } from './ServiceSelector'
import { TimeSlotPicker } from './TimeSlotPicker'
import type { Appointment } from '../../types'
import { useBookingForm } from '../../hooks/use-booking-form.hook'
import { formatShortDate } from '../../lib/date.utils'

interface BookingFormProps {
  initialData?: Appointment
  onSuccess: (appointment: Appointment) => void
  onError?: (message: string) => void
}

export function BookingForm({ initialData, onSuccess, onError }: BookingFormProps) {
  const {
    form,
    step,
    goToStep2,
    goToStep3,
    goBack,
    selectedServices,
    setSelectedServices,
    selectedDate,
    watchedTime,
    disabledDays,
    availableSlots,
    blockedSlots,
    totalSelectedDuration,
    serviceWarnings,
    sameWeekSuggestionDate,
    isSubmitting,
    isEditing,
    hasUserPrefill,
    handleDateSelect,
    applySuggestedDate,
    handleSubmit,
    handlePhoneChange,
  } = useBookingForm({ initialData, onSuccess, onError })

  const { register, setValue, getValues, formState: { errors } } = form

  const totalSteps = hasUserPrefill ? 2 : 3
  const visualStep = hasUserPrefill ? step - 1 : step

  const slideVariants = {
    enter:  { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0  },
    exit:   { opacity: 0, x: -20 },
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              visualStep > i ? 'bg-pink-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">

        {step === 1 && !hasUserPrefill && (
          <motion.div key="step-1" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
            <StepLabel step={1} label="Seus dados" />

            <FormField label="Nome completo" error={errors.clientName?.message}>
              <Input id="clientName" placeholder="Nome e sobrenome" autoComplete="name" {...register('clientName')} />
            </FormField>

            <FormField label="Telefone / WhatsApp" error={errors.clientPhone?.message}>
              <Input
                id="clientPhone"
                placeholder="(11) 99999-9999"
                inputMode="tel"
                autoComplete="tel"
                {...register('clientPhone')}
                onChange={handlePhoneChange}
              />
            </FormField>

            <FormField label="E-mail" error={errors.clientEmail?.message}>
              <Input id="clientEmail" type="email" placeholder="seu@email.com" autoComplete="email" {...register('clientEmail')} />
            </FormField>

            <Button type="button" className="w-full" onClick={goToStep2}>Próximo</Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step-2" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
            <StepLabel step={hasUserPrefill ? 1 : 2} label="Serviços" />

            {hasUserPrefill && (
              <div className="flex items-center gap-2 bg-pink-50 border border-pink-100 rounded-lg px-3 py-2">
                <User className="h-4 w-4 text-pink-400 shrink-0" />
                <div className="text-sm text-pink-800 min-w-0">
                  <span className="font-medium">{getValues('clientName')}</span>
                  <span className="text-pink-400 mx-1">·</span>
                  <span className="text-pink-600">{getValues('clientPhone')}</span>
                </div>
              </div>
            )}

            <ServiceSelector selected={selectedServices} onChange={setSelectedServices} />

            <AnimatePresence>
              {serviceWarnings.map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3"
                >
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800">{w.message}</p>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex gap-2">
              {!hasUserPrefill && (
                <Button type="button" variant="outline" className="flex-1" onClick={() => goBack(1)}>Voltar</Button>
              )}
              <Button type="button" className="flex-1" disabled={selectedServices.length === 0} onClick={goToStep3}>
                Próximo
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step-3" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
            <StepLabel step={hasUserPrefill ? 2 : 3} label="Data e horário" />

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
                      type="button" size="sm" variant="outline"
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
                disabled={disabledDays}
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
                <TimeSlotPicker
                  availableSlots={availableSlots}
                  selectedTime={watchedTime}
                  blockedSlots={blockedSlots}
                  totalDurationMinutes={totalSelectedDuration}
                  onSelect={(slot) => setValue('time', slot, { shouldValidate: true })}
                  error={errors.time?.message}
                />
              </motion.div>
            )}

            <FormField label="Observações (opcional)" error={errors.notes?.message}>
              <Input id="notes" placeholder="Alguma observação? (máx. 300 caracteres)" {...register('notes')} />
            </FormField>

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => goBack(2)}>Voltar</Button>
              <Button type="submit" className="flex-1" disabled={!selectedDate || !watchedTime || isSubmitting}>
                {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Confirmar agendamento'}
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </form>
  )
}

function StepLabel({ step, label }: { step: number; label: string }) {
  return (
    <p className="text-sm font-medium text-pink-700 uppercase tracking-wide">
      Passo {step} — {label}
    </p>
  )
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
