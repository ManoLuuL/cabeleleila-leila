import { motion } from 'framer-motion'

type EmptyStateProps = {
  message: string
}

export const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center text-gray-400 text-sm py-8"
    >
      {message}
    </motion.p>
  )
}
