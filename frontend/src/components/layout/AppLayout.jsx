import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import { useAppStore } from '../../store/useAppStore';
import { useEffect } from 'react';
import CommandPalette from '../CommandPalette';
import { ToastManager } from '../ui/ToastManager';
import Footer from '../Footer';

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

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') return 'Workspace / Dashboard';
    if (path === '/kanban') return 'Workspace / Kanban Board';
    if (path === '/analytics') return 'Workspace / Analytics';
    if (path === '/focus') return 'Workspace / Focus Mode';
    if (path === '/settings') return 'Workspace / Settings';
    if (path === '/profile') return 'Workspace / Profile';
    if (path === '/about') return 'Workspace / About';
    if (path.startsWith('/tasks/new')) return 'Tasks / New';
    if (path.includes('/edit')) return 'Tasks / Edit';
    return 'Workspace';
  };

  return (
    <div className="flex h-screen bg-[var(--color-surface)] text-[var(--color-text-primary)] overflow-hidden selection:bg-primary/30">
      <Sidebar />
      <CommandPalette />
      <ToastManager />

      <main className="flex-1 flex flex-col relative z-10 transition-all duration-300 ease-in-out h-full overflow-hidden">
        {/* Notion topbar */}
        <div className="h-14 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between px-6 lg:px-10 shrink-0">
          <div className="flex items-center gap-3 pl-12 lg:pl-0">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)] tracking-tight">
              {getBreadcrumbs()}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => useAppStore.getState().setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] rounded-lg text-[10px] text-[var(--color-text-secondary)] font-semibold transition-colors"
            >
              <span>Search commands</span>
              <kbd className="bg-[var(--color-surface-elevated)] px-1 rounded text-[9px] font-mono">⌘K</kbd>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 flex flex-col justify-between">
          <div className="flex-1 w-full max-w-7xl mx-auto mb-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
