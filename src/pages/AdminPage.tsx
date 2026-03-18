import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BarChart3, CalendarCheck, Users, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react'
import { ToastProvider } from '../components/ui'
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui'
import { BookingForm } from '../components/booking'
import { AppointmentRow, StatCard, WeeklyCalendar, StatusBreakdown } from '../components/admin'
import { EmptyState, ToastRenderer } from '../components/common'
import { useAppointmentStore } from '../store'
import { useToast, useWeeklyStats } from '../hooks'
import { formatCurrency } from '../lib/currency.utils'
import type { Appointment, AppointmentStatus } from '../types'

export function AdminPage() {
  const { appointments, loadAppointments, updateAppointmentStatus } = useAppointmentStore()
  const { toasts, showToast, dismissToast } = useToast()

  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)

  useEffect(() => { loadAppointments() }, [loadAppointments])

  const { stats, weekStart, weekEnd, weekAppointments } = useWeeklyStats(appointments, weekOffset)

  const sortedAppointments = [...appointments].sort(
    (a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time),
  )

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    await updateAppointmentStatus(id, status)
    showToast({ title: 'Status atualizado', variant: 'success' })
  }

  const handleEditSuccess = () => {
    setEditingAppointment(null)
    showToast({ title: 'Agendamento atualizado!', variant: 'success' })
  }

  return (
    <ToastProvider>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-500 text-sm">Gerencie os agendamentos do salão</p>
        </motion.div>

        <Tabs defaultValue="appointments">
          <TabsList>
            <TabsTrigger value="appointments">
              <CalendarCheck className="h-4 w-4 mr-1" />
              Agendamentos
            </TabsTrigger>
            <TabsTrigger value="dashboard">
              <BarChart3 className="h-4 w-4 mr-1" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          {/* ── Appointments tab ── */}
          <TabsContent value="appointments" className="space-y-4">
            {sortedAppointments.length === 0 && (
              <EmptyState message="Nenhum agendamento ainda" />
            )}
            {sortedAppointments.map((appointment) => (
              <AppointmentRow
                key={appointment.id}
                appointment={appointment}
                onEdit={setEditingAppointment}
                onStatusChange={handleStatusChange}
              />
            ))}
          </TabsContent>

          {/* ── Dashboard tab ── */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Week navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={() => setWeekOffset((w) => w - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <p className="text-sm font-medium text-gray-700">
                {format(weekStart, "dd 'de' MMM", { locale: ptBR })}
                {' — '}
                {format(weekEnd, "dd 'de' MMM", { locale: ptBR })}
              </p>
              <Button variant="outline" size="icon" onClick={() => setWeekOffset((w) => w + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                icon={<Users className="h-5 w-5 text-pink-500" />}
                label="Total"
                value={stats.totalAppointments}
              />
              <StatCard
                icon={<CalendarCheck className="h-5 w-5 text-blue-500" />}
                label="Confirmados"
                value={stats.confirmedCount}
              />
              <StatCard
                icon={<CalendarCheck className="h-5 w-5 text-green-500" />}
                label="Concluídos"
                value={stats.completedCount}
              />
              <StatCard
                icon={<DollarSign className="h-5 w-5 text-emerald-500" />}
                label="Receita"
                value={formatCurrency(stats.totalRevenueInCents)}
              />
            </div>

            <WeeklyCalendar
              weekStart={weekStart}
              weekEnd={weekEnd}
              appointments={weekAppointments}
            />

            <StatusBreakdown stats={stats} />
          </TabsContent>
        </Tabs>

        {/* Edit dialog */}
        <Dialog
          open={!!editingAppointment}
          onOpenChange={(open) => !open && setEditingAppointment(null)}
        >
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Agendamento</DialogTitle>
            </DialogHeader>
            {editingAppointment && (
              <BookingForm
                initialData={editingAppointment}
                onSuccess={handleEditSuccess}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <ToastRenderer toasts={toasts} onDismiss={dismissToast} />
    </ToastProvider>
  )
}
