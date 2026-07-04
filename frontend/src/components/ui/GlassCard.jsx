import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = true, delay = 0, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay }}
      onClick={onClick}
      className={`border border-[var(--color-border)] bg-[var(--color-surface)] rounded-xl p-6 ${
        onClick ? 'cursor-pointer hover:bg-[var(--color-surface-elevated)] transition-colors duration-150' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
