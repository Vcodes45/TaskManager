import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = true, delay = 0, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover && onClick ? { scale: 1.02, y: -4 } : hover ? { y: -4 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`glass bg-surface-elevated/60 border border-[var(--color-border-light)] rounded-2xl p-6 shadow-xl ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
