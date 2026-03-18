import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, History } from 'lucide-react'
import { ToastProvider } from '../components/ui'
import { Button, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui'
import { BookingForm } from '../components/booking'
import { AppointmentCard } from '../components/appointment'
import { EmptyState, ToastRenderer } from '../components/common'
import { useAppointmentStore } from '../store'
import { useToast } from '../hooks'
import type { Appointment } from '../types'

export function ClientPage() {
  const { appointments, loadAppointments, updateAppointmentStatus } = useAppointmentStore()
  const { toasts, showToast, dismissToast } = useToast()

  const [isBookingOpen, setIsBookingOpen]       = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [searchPhone, setSearchPhone]           = useState('')
  const [historyPhone, setHistoryPhone]         = useState('')

  useEffect(() => { loadAppointments() }, [loadAppointments])

  const normalizePhone = (p: string) => p.replace(/\D/g, '')

  const activeAppointments = searchPhone
    ? appointments.filter(
        (a) =>
          normalizePhone(a.clientPhone).includes(normalizePhone(searchPhone)) &&
          a.status !== 'cancelled' &&
          a.status !== 'completed',
      )
    : []

  const historyAppointments = historyPhone
    ? [...appointments]
        .filter((a) => normalizePhone(a.clientPhone).includes(normalizePhone(historyPhone)))
        .sort((a, b) => b.date.localeCompare(a.date))
    : []

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

  const handleCancelAppointment = async (appointment: Appointment) => {
    await updateAppointmentStatus(appointment.id, 'cancelled')
    showToast({ title: 'Agendamento cancelado' })
  }

  return (
    <ToastProvider>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl font-bold text-gray-900">✂️ Salão da Leila</h1>
          <p className="text-gray-500">Agende seus serviços de beleza com facilidade</p>
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
              <Search className="h-4 w-4 mr-1" />
              Meus Agendamentos
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              <History className="h-4 w-4 mr-1" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <div className="space-y-1">
              <Label>Buscar pelo telefone</Label>
              <Input
                placeholder="(11) 99999-9999"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
              />
            </div>
            <AnimatePresence>
              {searchPhone && activeAppointments.length === 0 && (
                <EmptyState message="Nenhum agendamento ativo encontrado" />
              )}
              {activeAppointments
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((a) => (
                  <AppointmentCard
                    key={a.id}
                    appointment={a}
                    onEdit={openEditBooking}
                    onCancel={handleCancelAppointment}
                  />
                ))}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="space-y-1">
              <Label>Seu telefone para ver o histórico</Label>
              <Input
                placeholder="(11) 99999-9999"
                value={historyPhone}
                onChange={(e) => setHistoryPhone(e.target.value)}
              />
            </div>
            <AnimatePresence>
              {historyPhone && historyAppointments.length === 0 && (
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
            />
          </DialogContent>
        </Dialog>
      </div>

      <ToastRenderer toasts={toasts} onDismiss={dismissToast} />
    </ToastProvider>
  )
}
