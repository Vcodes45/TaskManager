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
            className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)] shadow-md`}
          >
            <div className="shrink-0">
              {toast.type === 'xp' ? <FiCheckCircle size={20} className="text-[var(--color-accent)]" /> :
               toast.type === 'achievement' ? <FiAward size={20} className="text-[var(--color-warning)]" /> :
               toast.type === 'success' ? <FiCheckCircle size={20} className="text-[var(--color-success)]" /> :
               <FiInfo size={20} className="text-[var(--color-text-secondary)]" />}
            </div>
            <div>
              {toast.title && <h4 className="font-bold text-xs">{toast.title}</h4>}
              <p className="text-[10px] font-semibold text-[var(--color-text-secondary)] mt-0.5">{toast.message}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
