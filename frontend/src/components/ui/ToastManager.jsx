import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAward, FiCheckCircle, FiInfo } from 'react-icons/fi';

// Toast Store
export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Date.now().toString();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    
    // Auto remove
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, toast.duration || 4000);
  },
  removeToast: (id) => 
    set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }))
}));

// Global Toast Container Component
export function ToastManager() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-xl ${
              toast.type === 'xp' ? 'bg-gradient-to-r from-primary/90 to-blue-500/90 border-[var(--color-border)] text-[var(--color-text-primary)]' :
              toast.type === 'achievement' ? 'bg-gradient-to-r from-yellow-500/90 to-orange-500/90 border-[var(--color-border)] text-[var(--color-text-primary)]' :
              toast.type === 'success' ? 'bg-green-500/90 border-[var(--color-border)] text-[var(--color-text-primary)]' :
              'bg-surface-elevated/90 border-[var(--color-border-light)] text-[var(--color-text-primary)]'
            }`}
          >
            <div className="shrink-0">
              {toast.type === 'xp' ? <FiCheckCircle size={24} className="text-[var(--color-text-primary)] drop-shadow-md" /> :
               toast.type === 'achievement' ? <FiAward size={24} className="text-[var(--color-text-primary)] drop-shadow-md" /> :
               toast.type === 'success' ? <FiCheckCircle size={24} /> :
               <FiInfo size={24} />}
            </div>
            <div>
              {toast.title && <h4 className="font-bold text-sm drop-shadow-md">{toast.title}</h4>}
              <p className="text-xs font-medium opacity-90 drop-shadow-sm">{toast.message}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
