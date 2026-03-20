/**
 * ViewModel hook for the booking form.
 *
 * Flow (create):  Step 1 → Services  →  Step 2 → Date & time  →  Confirm (user always logged in)
 * Flow (edit):    Same 2 steps, pre-filled from existing appointment.
 */
import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import type { Appointment, AppointmentCreateInput, AppointmentUpdateInput, Service } from '../types'
import { useAppointmentStore, useAuthStore } from '../store'
import {
  appointmentService,
  TimeConflictError,
  PastDateError,
  ClosedDayError,
  TooFarInAdvanceError,
  WorkingHoursError,
  ImmutableAppointmentError,
  CancellationWindowError,
} from '../services'
import { bookingFormSchema, type BookingFormValues } from '../lib/validation.schemas'
import { getBlockedSlots, getAvailableSlots, type BlockedSlot } from '../lib/schedule.utils'
import { getServiceCombinationWarnings, type ServiceCombinationWarning } from '../lib/service-rules.utils'
import { getDisabledDays } from '../lib/date.utils'
import type { Matcher } from 'react-day-picker'
import { TIME_SLOTS } from '../lib/constants'

interface UseBookingFormOptions {
  initialData?: Appointment
  onSuccess: (appointment: Appointment) => void
  onError?: (message: string) => void
}

export function useBookingForm({ initialData, onSuccess, onError }: UseBookingFormOptions) {
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
      clientName:  initialData?.clientName  ?? user?.name  ?? '',
      clientPhone: initialData?.clientPhone ?? user?.phone ?? '',
      clientEmail: initialData?.clientEmail ?? user?.email ?? '',
      time:        initialData?.time  ?? '',
      notes:       initialData?.notes ?? '',
    },
  })

  const watchedTime = form.watch('time')

  // ── Disabled days for DayPicker ───────────────────────────────────────────
  const disabledDays = useMemo<Matcher[]>(() => getDisabledDays(), [])

  // ── Service combination warnings ──────────────────────────────────────────
  const serviceWarnings = useMemo<ServiceCombinationWarning[]>(
    () => getServiceCombinationWarnings(selectedServices),
    [selectedServices],
  )

  // ── Total duration ────────────────────────────────────────────────────────
  const totalSelectedDuration = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0),
    [selectedServices],
  )

  // ── Available slots filtered by working hours ─────────────────────────────
  const availableSlots = useMemo(
    () => getAvailableSlots(TIME_SLOTS, totalSelectedDuration),
    [totalSelectedDuration],
  )

  // ── Blocked slots (conflicts) ─────────────────────────────────────────────
  const blockedSlots = useMemo<Map<string, BlockedSlot>>(() => {
    if (!selectedDate) return new Map()
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    return getBlockedSlots(appointments, dateStr, initialData?.id)
  }, [selectedDate, appointments, initialData?.id])

  // ── Date selection + same-week suggestion ────────────────────────────────
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

  // ── Navigation ────────────────────────────────────────────────────────────
  const goToStep2 = () => { if (selectedServices.length > 0) setStep(2) }
  const goBack    = () => setStep(1)

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedDate || selectedServices.length === 0 || !watchedTime || !user) return

    setIsSubmitting(true)
    try {
      if (isEditing && initialData) {
        const input: AppointmentUpdateInput = {
          clientName:  user.name,
          clientPhone: user.phone,
          clientEmail: user.email,
          services:    selectedServices,
          date:        format(selectedDate, 'yyyy-MM-dd'),
          time:        watchedTime,
          notes:       form.getValues('notes'),
        }
        await updateAppointment(initialData.id, input)
        onSuccess({ ...initialData, ...input })
      } else {
        const input: AppointmentCreateInput = {
          clientName:  user.name,
          clientPhone: user.phone,
          clientEmail: user.email,
          services:    selectedServices,
          date:        format(selectedDate, 'yyyy-MM-dd'),
          time:        watchedTime,
          status:      'pending',
          notes:       form.getValues('notes'),
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

// ── Error message resolver ────────────────────────────────────────────────────

function resolveErrorMessage(err: unknown): string {
  if (
    err instanceof TimeConflictError      ||
    err instanceof PastDateError          ||
    err instanceof ClosedDayError         ||
    err instanceof TooFarInAdvanceError   ||
    err instanceof WorkingHoursError      ||
    err instanceof ImmutableAppointmentError ||
    err instanceof CancellationWindowError
  ) {
    return err.message
  }
  return 'Erro ao salvar agendamento. Tente novamente.'
}
