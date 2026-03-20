import { motion } from 'framer-motion'
import { Card, CardContent } from '../../ui'
import type { StatCardProps } from './types'

export const StatCard = (props: StatCardProps) => {
  const { icon, label, value } = props

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
