import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import type { Matcher } from 'react-day-picker'
import type { UseBookingFormOptions } from './types'
import { useAppointmentStore, useAuthStore } from '../../store'
import type { AppointmentCreateInput, AppointmentUpdateInput, Service } from '../../types'
import { bookingFormSchema, type BookingFormValues } from '../../lib/validation.schemas'
import { getDisabledDays } from '../../lib/date.utils'
import { getServiceCombinationWarnings, type ServiceCombinationWarning } from '../../lib/service-rules.utils'
import { TIME_SLOTS } from '../../lib/constants'
import { getAvailableSlots, getBlockedSlots, type BlockedSlot } from '../../lib/schedule.utils'
import { appointmentService, CancellationWindowError, ClosedDayError, ImmutableAppointmentError, PastDateError, TimeConflictError, TooFarInAdvanceError, WorkingHoursError } from '../../services'


export const  useBookingForm = ({ initialData, onSuccess, onError }: UseBookingFormOptions) => {
  const { appointments, createAppointment, updateAppointment } = useAppointmentStore()
  const { user } = useAuthStore()

  const isEditing = !!initialData

  const [selectedServices, setSelectedServices] = useState<Service[]>(initialData?.services ?? [])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialData ? new Date(`${initialData.date}T12:00:00`) : undefined,
  )
  const [step, setStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sameWeekSuggestionDate, setSameWeekSuggestionDate] = useState<string | null>(null)

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    mode: 'onTouched',
    defaultValues: {
      clientName: initialData?.clientName ?? user?.name ?? '',
      clientPhone: initialData?.clientPhone ?? user?.phone ?? '',
      clientEmail: initialData?.clientEmail ?? user?.email ?? '',
      time: initialData?.time ?? '',
      notes: initialData?.notes ?? '',
    },
  })

  const watchedTime = form.watch('time')


  const disabledDays = useMemo<Matcher[]>(() => getDisabledDays(), [])


  const serviceWarnings = useMemo<ServiceCombinationWarning[]>(
    () => getServiceCombinationWarnings(selectedServices),
    [selectedServices],
  )

  const totalSelectedDuration = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0),
    [selectedServices],
  )

  const availableSlots = useMemo(
    () => getAvailableSlots(TIME_SLOTS, totalSelectedDuration),
    [totalSelectedDuration],
  )

  const blockedSlots = useMemo<Map<string, BlockedSlot>>(() => {
    if (!selectedDate) return new Map()
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    return getBlockedSlots(appointments, dateStr, initialData?.id)
  }, [selectedDate, appointments, initialData?.id])


  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSameWeekSuggestionDate(null)
    form.setValue('time', '')

    if (!date || !user?.phone) return

    const dateStr = format(date, 'yyyy-MM-dd')
    const existing = appointmentService.findSameWeekAppointment(
      appointments,
      user.phone.replace(/\D/g, ''),
      dateStr,
      initialData?.id,
    )
    if (existing) setSameWeekSuggestionDate(existing.date)
  }

  const applySuggestedDate = () => {
    if (!sameWeekSuggestionDate) return
    setSelectedDate(new Date(`${sameWeekSuggestionDate}T12:00:00`))
    setSameWeekSuggestionDate(null)
    form.setValue('time', '')
  }


  const goToStep2 = () => { if (selectedServices.length > 0) setStep(2) }
  const goBack = () => setStep(1)


  const handleSubmit = async () => {
    if (!selectedDate || selectedServices.length === 0 || !watchedTime || !user) return

    setIsSubmitting(true)
    try {
      if (isEditing && initialData) {
        const input: AppointmentUpdateInput = {
          clientName:  initialData.clientName,
          clientPhone: initialData.clientPhone,
          clientEmail: initialData.clientEmail,
          services:    selectedServices,
          date:        format(selectedDate, 'yyyy-MM-dd'),
          time:        watchedTime,
          notes:       form.getValues('notes'),
        }
        await updateAppointment(initialData.id, input)
        onSuccess({ ...initialData, ...input })
      } else {
        const input: AppointmentCreateInput = {
          clientName: user.name,
          clientPhone: user.phone,
          clientEmail: user.email,
          services: selectedServices,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: watchedTime,
          status: 'pending',
          notes: form.getValues('notes'),
        }
        const created = await createAppointment(input)
        onSuccess(created)
      }
    } catch (err) {
      const message = resolveErrorMessage(err)
      if (err instanceof TimeConflictError || err instanceof WorkingHoursError) {
        form.setError('time', { message })
      }
      onError?.(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
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
  }
}


function resolveErrorMessage(err: unknown): string {
  if (
    err instanceof TimeConflictError ||
    err instanceof PastDateError ||
    err instanceof ClosedDayError ||
    err instanceof TooFarInAdvanceError ||
    err instanceof WorkingHoursError ||
    err instanceof ImmutableAppointmentError ||
    err instanceof CancellationWindowError
  ) {
    return err.message
  }
  return 'Erro ao salvar agendamento. Tente novamente.'
}
