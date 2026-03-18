import { format, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Appointment } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui'

interface WeeklyCalendarProps {
  weekStart: Date
  weekEnd: Date
  appointments: Appointment[]
}

export function WeeklyCalendar({ weekStart, weekEnd, appointments }: WeeklyCalendarProps) {
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Agendamentos da semana</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd')
            const dayAppointments = appointments.filter((a) => a.date === dayStr)

            return (
              <div key={dayStr} className="text-center">
                <p className="text-xs text-gray-400 mb-1">
                  {format(day, 'EEE', { locale: ptBR })}
                </p>
                <p className="text-sm font-medium text-gray-700 mb-2">{format(day, 'd')}</p>
                <div className="space-y-1">
                  {dayAppointments.map((a) => (
                    <div
                      key={a.id}
                      title={a.clientName}
                      className="text-xs bg-pink-100 text-pink-700 rounded px-1 py-0.5 truncate"
                    >
                      {a.time} {a.clientName.split(' ')[0]}
                    </div>
                  ))}
                  {dayAppointments.length === 0 && <div className="h-6" />}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
