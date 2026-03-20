import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { CalendarIcon, AlertCircle } from 'lucide-react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { ServiceSelector } from '../booking-service-selector'
import { TimeSlotPicker } from '../booking-time-slot-picker'
import { useBookingForm } from '../../../hooks/use-booking-form'
import { formatShortDate } from '../../../lib/date.utils'
import type { BookingFormProps } from './types'
import { StepLabel } from './components/step-label'


export const BookingForm = (props: BookingFormProps) => {
  const { initialData, onSuccess, onError } = props

  const {
    form,
    step,
    goToStep2,
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
    handleDateSelect,
    applySuggestedDate,
    handleSubmit,
  } = useBookingForm({ initialData, onSuccess, onError })

  const { register, setValue, formState: { errors } } = form

  const slideVariants = {
    enter:  { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0  },
    exit:   { opacity: 0, x: -20 },
  }

  return (
    <div className="space-y-6">
    
      <div className="flex gap-1">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              step >= s ? 'bg-pink-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">

       
        {step === 1 && (
          <motion.div key="step-1" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
            <StepLabel step={1} label="Serviços" />

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

            <Button type="button" className="w-full" disabled={selectedServices.length === 0} onClick={goToStep2}>
              Próximo
            </Button>
          </motion.div>
        )}

      
        {step === 2 && (
          <motion.div key="step-2" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
            <StepLabel step={2} label="Data e horário" />

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

            <div className="space-y-1">
              <Label>Observações (opcional)</Label>
              <Input placeholder="Alguma observação? (máx. 300 caracteres)" {...register('notes')} />
              {errors.notes && <p className="text-xs text-red-500">{errors.notes.message}</p>}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={goBack}>
                Voltar
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={!selectedDate || !watchedTime || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Confirmar agendamento'}
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}


