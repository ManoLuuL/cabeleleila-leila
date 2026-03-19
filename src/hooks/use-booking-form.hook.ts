/**
 * ViewModel hook for the booking form.
 * Encapsulates all form logic, keeping the component purely presentational.
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
  DuplicateAppointmentError,
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

  // If logged-in user data is available and not editing, pre-fill from user profile
  const prefill = {
    clientName:  initialData?.clientName  ?? user?.name  ?? '',
    clientPhone: initialData?.clientPhone ?? user?.phone ?? '',
    clientEmail: initialData?.clientEmail ?? user?.email ?? '',
  }

  // Skip step 1 when creating a new appointment (data comes from logged-in user)
  const initialStep = !initialData && user ? 2 : 1

  const [selectedServices, setSelectedServices] = useState<Service[]>(initialData?.services ?? [])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialData ? new Date(`${initialData.date}T12:00:00`) : undefined,
  )
  const [step, setStep] = useState<1 | 2 | 3>(initialStep)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sameWeekSuggestionDate, setSameWeekSuggestionDate] = useState<string | null>(null)

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    mode: 'onTouched',
    defaultValues: {
      clientName:  prefill.clientName,
      clientPhone: prefill.clientPhone,
      clientEmail: prefill.clientEmail,
      time:        initialData?.time  ?? '',
      notes:       initialData?.notes ?? '',
    },
  })

  const watchedPhone = form.watch('clientPhone')
  const watchedTime  = form.watch('time')

  // ── Phone mask ────────────────────────────────────────────────────────────
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11)
    let masked = digits
    if (digits.length > 10) {
      masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    } else if (digits.length > 6) {
      masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    } else if (digits.length > 2) {
      masked = `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    } else if (digits.length > 0) {
      masked = `(${digits}`
    }
    form.setValue('clientPhone', masked, { shouldValidate: form.formState.touchedFields.clientPhone })
  }

  // ── Disabled days for DayPicker ───────────────────────────────────────────
  const disabledDays = useMemo<Matcher[]>(() => getDisabledDays(), [])

  // ── Service combination warnings ──────────────────────────────────────────
  const serviceWarnings = useMemo<ServiceCombinationWarning[]>(
    () => getServiceCombinationWarnings(selectedServices),
    [selectedServices],
  )

  // ── Total duration of selected services ────────────────────────────────────
  const totalSelectedDuration = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0),
    [selectedServices],
  )

  // ── Slots filtered by working hours ───────────────────────────────────────
  const availableSlots = useMemo(
    () => getAvailableSlots(TIME_SLOTS, totalSelectedDuration),
    [totalSelectedDuration],
  )

  // ── Blocked slots (conflicts with other appointments) ─────────────────────
  const blockedSlots = useMemo<Map<string, BlockedSlot>>(() => {
    if (!selectedDate) return new Map()
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    return getBlockedSlots(appointments, dateStr, initialData?.id)
  }, [selectedDate, appointments, initialData?.id])

  // ── Date selection ─────────────────────────────────────────────────────────
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSameWeekSuggestionDate(null)
    form.setValue('time', '')

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
    form.setValue('time', '')
  }

  // ── Step navigation with field-level validation ────────────────────────────
  const goToStep2 = async () => {
    const valid = await form.trigger(['clientName', 'clientPhone', 'clientEmail'])
    if (valid) setStep(2)
  }

  const goToStep3 = () => {
    if (selectedServices.length > 0) setStep(3)
  }

  const goBack = (to: 1 | 2) => setStep(to)

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = form.handleSubmit(async (values) => {
    if (!selectedDate || selectedServices.length === 0) return
    setIsSubmitting(true)
    try {
      if (initialData) {
        // Edit: only send changed fields, preserve existing status
        const input: AppointmentUpdateInput = {
          clientName:  values.clientName,
          clientPhone: values.clientPhone,
          clientEmail: values.clientEmail,
          services:    selectedServices,
          date:        format(selectedDate, 'yyyy-MM-dd'),
          time:        values.time,
          notes:       values.notes,
        }
        await updateAppointment(initialData.id, input)
        onSuccess({ ...initialData, ...input })
      } else {
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
  })

  return {
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
    isEditing: !!initialData,
    hasUserPrefill: !!user && !initialData,
    handleDateSelect,
    applySuggestedDate,
    handleSubmit,
    handlePhoneChange,
  }
}

// ── Error message resolver ───────────────────────────────────────────────────

function resolveErrorMessage(err: unknown): string {
  if (
    err instanceof TimeConflictError      ||
    err instanceof PastDateError          ||
    err instanceof ClosedDayError         ||
    err instanceof TooFarInAdvanceError   ||
    err instanceof WorkingHoursError      ||
    err instanceof DuplicateAppointmentError ||
    err instanceof ImmutableAppointmentError ||
    err instanceof CancellationWindowError
  ) {
    return err.message
  }
  return 'Erro ao salvar agendamento. Tente novamente.'
}
