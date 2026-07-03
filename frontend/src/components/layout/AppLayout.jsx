import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import { useAppStore } from '../../store/useAppStore';
import { useEffect } from 'react';
import CommandPalette from '../CommandPalette';

import { ToastManager } from '../ui/ToastManager';

export default function AppLayout({ children }) {
  const location = useLocation();
  const { isSidebarOpen } = useAppStore();

  // Handle Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        useAppStore.getState().setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)] text-[var(--color-text-primary)] overflow-hidden selection:bg-primary/30">
      
      {/* Global Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{ 
            x: [0, 50, -20, 0], 
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-primary/10 blur-[100px]"
        />
        <motion.div 
          animate={{ 
            x: [0, -40, 30, 0], 
            y: [0, 50, -10, 0],
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent/10 blur-[120px]"
        />
      </div>

      <Sidebar />
      <CommandPalette />
      <ToastManager />

      <main 
        className={`flex-1 relative z-10 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'lg:pl-0' : 'lg:pl-0'}`} // Sidebar handles its own width in the flex container
      >
        <div className="h-full overflow-y-auto overflow-x-hidden p-6 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-full max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
