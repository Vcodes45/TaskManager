import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiHome, FiList, FiLayout, FiCalendar, FiClock, FiPieChart } from 'react-icons/fi';
import { useAppStore } from '../store/useAppStore';

const actions = [
  { id: 'home', name: 'Go to Dashboard', path: '/', icon: FiHome },
  { id: 'tasks', name: 'My Tasks', path: '/tasks', icon: FiList },
  { id: 'kanban', name: 'Kanban Board', path: '/kanban', icon: FiLayout },
  { id: 'calendar', name: 'Calendar', path: '/calendar', icon: FiCalendar },
  { id: 'focus', name: 'Focus Mode', path: '/focus', icon: FiClock },
  { id: 'analytics', name: 'Analytics', path: '/analytics', icon: FiPieChart },
];

export default function CommandPalette() {
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const filteredActions = query === '' 
    ? actions 
    : actions.filter((action) => 
        action.name.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isCommandPaletteOpen) return;
      
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
      } else if (e.key === 'Enter' && filteredActions[selectedIndex]) {
        e.preventDefault();
        navigate(filteredActions[selectedIndex].path);
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, filteredActions, selectedIndex, navigate, setCommandPaletteOpen]);

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] sm:pt-[25vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/45"
            onClick={() => setCommandPaletteOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-md overflow-hidden mx-4"
          >
            <div className="flex items-center px-4 py-3 border-b border-[var(--color-border)]">
              <FiSearch className="w-4 h-4 text-[var(--color-text-secondary)]" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search commands..."
                className="w-full px-3 py-1 bg-transparent border-none text-[var(--color-text-primary)] focus:outline-none focus:ring-0 text-sm placeholder-gray-400"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
              />
              <div className="flex items-center space-x-1 px-2 py-1 bg-[var(--color-text-primary)]/5 rounded text-xs text-[var(--color-text-secondary)] font-mono">
                <span>ESC</span>
              </div>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-1.5">
              {filteredActions.length === 0 ? (
                <div className="p-4 text-center text-[var(--color-text-secondary)]">No results found.</div>
              ) : (
                filteredActions.map((action, idx) => {
                  const isActive = idx === selectedIndex;
                  return (
                    <div
                      key={action.id}
                      onClick={() => {
                        navigate(action.path);
                        setCommandPaletteOpen(false);
                      }}
                      className={`flex items-center space-x-3 px-4 py-2 rounded-lg cursor-pointer transition-colors text-xs font-semibold ${
                        isActive ? 'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border)]' : 'text-[var(--color-text-secondary)] border border-transparent hover:bg-[var(--color-surface-elevated)]'
                      }`}
                    >
                      <action.icon className={`w-4 h-4 ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}`} />
                      <span>{action.name}</span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
