import { motion } from 'framer-motion'
import { Card, CardContent } from '../ui'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
}

export function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Card>
        <CardContent className="p-4 flex flex-col items-center gap-1 text-center">
          {icon}
          <p className="text-xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
