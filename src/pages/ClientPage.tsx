import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, History, CalendarCheck } from 'lucide-react'
import { ToastProvider } from '../components/ui'
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui'
import { BookingForm } from '../components/booking'
import { AppointmentCard } from '../components/appointment'
import { EmptyState, ToastRenderer } from '../components/common'
import { useAppointmentStore, useAuthStore } from '../store'
import { useToast } from '../hooks'
import { CancellationWindowError } from '../services'
import type { Appointment } from '../types'

export function ClientPage() {
  const { appointments, loadAppointments, cancelAppointmentByClient } = useAppointmentStore()
  const { user } = useAuthStore()
  const { toasts, showToast, dismissToast } = useToast()

  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)

  useEffect(() => { loadAppointments() }, [loadAppointments])

  // API already filters by userId — just split active vs history
  const activeAppointments = appointments
    .filter((a) => a.status !== 'cancelled' && a.status !== 'completed')
    .sort((a, b) => a.date.localeCompare(b.date))

  const historyAppointments = [...appointments]
    .filter((a) => a.status === 'cancelled' || a.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date))

  const openNewBooking = () => {
    setEditingAppointment(null)
    setIsBookingOpen(true)
  }

  const openEditBooking = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setIsBookingOpen(true)
  }

  const handleBookingSuccess = (appointment: Appointment) => {
    setIsBookingOpen(false)
    setEditingAppointment(null)
    showToast({
      title: editingAppointment ? 'Agendamento atualizado!' : 'Agendamento realizado!',
      description: `${appointment.clientName} — ${appointment.time}`,
      variant: 'success',
    })
  }

  const handleBookingError = (message: string) => {
    showToast({ title: 'Não foi possível agendar', description: message, variant: 'error' })
  }

  const handleCancelAppointment = async (appointment: Appointment) => {
    try {
      await cancelAppointmentByClient(appointment.id)
      showToast({ title: 'Agendamento cancelado' })
    } catch (err) {
      if (err instanceof CancellationWindowError) {
        showToast({ title: 'Cancelamento não permitido', description: err.message, variant: 'error' })
      } else {
        showToast({ title: 'Erro ao cancelar agendamento', variant: 'error' })
      }
    }
  }

  return (
    <ToastProvider>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-1"
        >
          <h1 className="text-3xl font-bold text-gray-900">✂️ Salão da Leila</h1>
          <p className="text-gray-500">
            Olá, <span className="font-medium text-pink-600">{user?.name.split(' ')[0]}</span>! Agende seus serviços de beleza.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <Button className="w-full" size="lg" onClick={openNewBooking}>
            <Plus className="h-5 w-5" />
            Novo Agendamento
          </Button>
        </motion.div>

        <Tabs defaultValue="active">
          <TabsList className="w-full">
            <TabsTrigger value="active" className="flex-1">
              <CalendarCheck className="h-4 w-4 mr-1" />
              Meus Agendamentos
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              <History className="h-4 w-4 mr-1" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 pt-2">
            <AnimatePresence>
              {activeAppointments.length === 0 && (
                <EmptyState message="Nenhum agendamento ativo. Que tal marcar um horário?" />
              )}
              {activeAppointments.map((a) => (
                <AppointmentCard
                  key={a.id}
                  appointment={a}
                  onEdit={openEditBooking}
                  onCancel={handleCancelAppointment}
                />
              ))}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 pt-2">
            <AnimatePresence>
              {historyAppointments.length === 0 && (
                <EmptyState message="Nenhum histórico encontrado" />
              )}
              {historyAppointments.map((a) => (
                <AppointmentCard key={a.id} appointment={a} showActions={false} />
              ))}
            </AnimatePresence>
          </TabsContent>
        </Tabs>

        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
              </DialogTitle>
            </DialogHeader>
            <BookingForm
              initialData={editingAppointment ?? undefined}
              onSuccess={handleBookingSuccess}
              onError={handleBookingError}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ToastRenderer toasts={toasts} onDismiss={dismissToast} />
    </ToastProvider>
  )
}
