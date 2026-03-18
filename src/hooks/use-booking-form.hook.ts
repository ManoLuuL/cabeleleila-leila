/**
 * ViewModel hook for the booking form.
 * Encapsulates all form logic, keeping the component purely presentational.
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, addDays } from 'date-fns'
import type { Appointment, AppointmentCreateInput, Service } from '../types'
import { useAppointmentStore } from '../store'
import { appointmentService } from '../services'
import { bookingFormSchema, type BookingFormValues } from '../lib/validation.schemas'

interface UseBookingFormOptions {
  initialData?: Appointment
  onSuccess: (appointment: Appointment) => void
}

export function useBookingForm({ initialData, onSuccess }: UseBookingFormOptions) {
  const { appointments, createAppointment, updateAppointment } = useAppointmentStore()

  const [selectedServices, setSelectedServices] = useState<Service[]>(initialData?.services ?? [])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialData ? new Date(`${initialData.date}T12:00:00`) : undefined,
  )
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sameWeekSuggestionDate, setSameWeekSuggestionDate] = useState<string | null>(null)

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      clientName:  initialData?.clientName  ?? '',
      clientPhone: initialData?.clientPhone ?? '',
      clientEmail: initialData?.clientEmail ?? '',
      time:        initialData?.time        ?? '',
      notes:       initialData?.notes       ?? '',
    },
  })

  const watchedPhone = form.watch('clientPhone')
  const watchedTime  = form.watch('time')

  const minDate = addDays(new Date(), 1)

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSameWeekSuggestionDate(null)
    if (!date || !watchedPhone) return

    const dateStr = format(date, 'yyyy-MM-dd')
    const existing = appointmentService.findSameWeekAppointment(
      appointments,
      watchedPhone.replace(/\D/g, ''),
      dateStr,
      initialData?.id,
    )
    if (existing) setSameWeekSuggestionDate(existing.date)
  }

  const applySuggestedDate = () => {
    if (!sameWeekSuggestionDate) return
    setSelectedDate(new Date(`${sameWeekSuggestionDate}T12:00:00`))
    setSameWeekSuggestionDate(null)
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!selectedDate || selectedServices.length === 0) return
    setIsSubmitting(true)
    try {
      const input: AppointmentCreateInput = {
        clientName:  values.clientName,
        clientPhone: values.clientPhone,
        clientEmail: values.clientEmail,
        services:    selectedServices,
        date:        format(selectedDate, 'yyyy-MM-dd'),
        time:        values.time,
        status:      'pending',
        notes:       values.notes,
      }
      if (initialData) {
        await updateAppointment(initialData.id, input)
        onSuccess({ ...initialData, ...input })
      } else {
        const created = await createAppointment(input)
        onSuccess(created)
      }
    } finally {
      setIsSubmitting(false)
    }
  })

  return {
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
    isEditing: !!initialData,
    handleDateSelect,
    applySuggestedDate,
    handleSubmit,
  }
}
