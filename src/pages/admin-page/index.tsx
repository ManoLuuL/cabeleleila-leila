import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BarChart3, CalendarCheck, Users, DollarSign, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { useAppointmentStore } from '../../store'
import { useToast, useWeeklyStats } from '../../hooks'
import type { Appointment, AppointmentStatus } from '../../types'
import { ImmutableAppointmentError, InvalidStatusTransitionError } from '../../services'
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger, ToastProvider } from '../../components/ui'
import { STATUS_LABELS } from '../../lib/constants'
import { EmptyState, ToastRenderer } from '../../components/common'
import { AppointmentRow, StatCard, StatusBreakdown, WeeklyCalendar } from '../../components/admin'
import { formatCurrency } from '../../lib/currency.utils'
import { BookingForm } from '../../components/booking'


export function AdminPage() {
  const { appointments, loadAppointments, updateAppointmentStatus } = useAppointmentStore()
  const { toasts, showToast, dismissToast } = useToast()

  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'all'>('all')
  const [filterSearch, setFilterSearch] = useState('')

  useEffect(() => { loadAppointments() }, [loadAppointments])

  const { stats, weekStart, weekEnd, weekAppointments } = useWeeklyStats(appointments, weekOffset)

  const sortedAppointments = useMemo(() => {
    const normalizedSearch = filterSearch.toLowerCase().trim()
    return [...appointments]
      .filter((a) => {
        const matchesStatus = filterStatus === 'all' || a.status === filterStatus
        const matchesSearch =
          !normalizedSearch ||
          a.clientName.toLowerCase().includes(normalizedSearch) ||
          a.clientPhone.replace(/\D/g, '').includes(normalizedSearch.replace(/\D/g, ''))
        return matchesStatus && matchesSearch
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
  }, [appointments, filterStatus, filterSearch])

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      await updateAppointmentStatus(id, status)
      showToast({ title: 'Status atualizado', variant: 'success' })
    } catch (err) {
      if (err instanceof InvalidStatusTransitionError || err instanceof ImmutableAppointmentError) {
        showToast({ title: 'Operação inválida', description: err.message, variant: 'error' })
      } else {
        showToast({ title: 'Erro ao atualizar status', variant: 'error' })
      }
    }
  }

  const handleEditSuccess = () => {
    setEditingAppointment(null)
    showToast({ title: 'Agendamento atualizado!', variant: 'success' })
  }

  const handleEditError = (message: string) => {
    showToast({ title: 'Não foi possível atualizar', description: message, variant: 'error' })
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

          <TabsContent value="appointments" className="space-y-4">
    
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  placeholder="Buscar por nome ou telefone"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className="pl-8 pr-8"
                />
                {filterSearch && (
                  <button
                    type="button"
                    onClick={() => setFilterSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Select
                value={filterStatus}
                onValueChange={(v) => setFilterStatus(v as AppointmentStatus | 'all')}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {(Object.keys(STATUS_LABELS) as AppointmentStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {sortedAppointments.length === 0 && (
              <EmptyState message={
                filterSearch || filterStatus !== 'all'
                  ? 'Nenhum agendamento encontrado para os filtros aplicados'
                  : 'Nenhum agendamento ainda'
              } />
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

         
          <TabsContent value="dashboard" className="space-y-6">
        
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
                onError={handleEditError}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <ToastRenderer toasts={toasts} onDismiss={dismissToast} />
    </ToastProvider>
  )
}
