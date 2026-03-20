import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, History, CalendarCheck, LogIn } from 'lucide-react'
import { ToastProvider } from '../../components/ui'
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui'
import { BookingForm } from '../../components/booking'
import { AppointmentCard } from '../../components/appointment'
import { EmptyState, ToastRenderer } from '../../components/common'
import { useAppointmentStore, useAuthStore } from '../../store'
import { useToast } from '../../hooks'
import { CancellationWindowError } from '../../services'
import { AuthPage } from '../auth-page'
import type { Appointment } from '../../types'
import type { ModalState } from './types'

export function ClientPage() {
  const { appointments, loadAppointments, cancelAppointmentByClient } = useAppointmentStore()
  const { user } = useAuthStore()
  const { toasts, showToast, dismissToast } = useToast()

  const [modal, setModal] = useState<ModalState>({ type: 'closed' })

  useEffect(() => {
    if (user) loadAppointments()
  }, [loadAppointments, user])

  const activeAppointments = appointments
    .filter((a) => a.status !== 'cancelled' && a.status !== 'completed')
    .sort((a, b) => a.date.localeCompare(b.date))

  const historyAppointments = [...appointments]
    .filter((a) => a.status === 'cancelled' || a.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date))

  const openNewBooking = () => {
    if (!user) {
      setModal({ type: 'auth' })
    } else {
      setModal({ type: 'booking' })
    }
  }

  const openEditBooking = (a: Appointment) => setModal({ type: 'booking', editing: a })

  const handleBookingSuccess = (appointment: Appointment) => {
    const wasEditing = modal.type === 'booking' && !!modal.editing
    setModal({ type: 'closed' })
    showToast({
      title: wasEditing ? 'Agendamento atualizado!' : 'Agendamento realizado!',
      description: `${appointment.clientName} — ${appointment.time}`,
      variant: 'success',
    })
  }

  const handleBookingError = (message: string) => {
    showToast({ title: 'Não foi possível agendar', description: message, variant: 'error' })
  }


  const handleAuthSuccess = async () => {
    await loadAppointments()
    setModal({ type: 'booking' })
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

  const isBookingOpen = modal.type === 'booking'
  const isAuthOpen    = modal.type === 'auth'
  const editingAppointment = modal.type === 'booking' ? modal.editing : undefined

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
            {user
              ? <>Olá, <span className="font-medium text-pink-600">{user.name.split(' ')[0]}</span>! Agende seus serviços de beleza.</>
              : 'Agende seus serviços de beleza com facilidade.'}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <Button className="w-full" size="lg" onClick={openNewBooking}>
            <Plus className="h-5 w-5" />
            Novo Agendamento
          </Button>
        </motion.div>

        {user ? (
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
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-3 py-8 text-center border border-dashed border-gray-200 rounded-xl"
          >
            <History className="h-8 w-8 text-gray-300" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Quer ver seus agendamentos?</p>
              <p className="text-xs text-gray-400">Entre ou crie uma conta para acessar seu histórico.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setModal({ type: 'auth' })} className="gap-1.5">
              <LogIn className="h-4 w-4" />
              Entrar / Cadastrar
            </Button>
          </motion.div>
        )}

       
        <Dialog open={isBookingOpen} onOpenChange={(open) => !open && setModal({ type: 'closed' })}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
              </DialogTitle>
            </DialogHeader>
            <BookingForm
              initialData={editingAppointment}
              onSuccess={handleBookingSuccess}
              onError={handleBookingError}
            />
          </DialogContent>
        </Dialog>

        
        <Dialog open={isAuthOpen} onOpenChange={(open) => !open && setModal({ type: 'closed' })}>
          <DialogContent className="max-w-sm p-0 overflow-hidden">
            <AuthPage onSuccess={handleAuthSuccess} embedded />
          </DialogContent>
        </Dialog>
      </div>

      <ToastRenderer toasts={toasts} onDismiss={dismissToast} />
    </ToastProvider>
  )
}
