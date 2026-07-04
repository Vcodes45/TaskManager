import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiCheck, FiCheckCircle, FiTrash2, FiZap, FiClock, FiX } from 'react-icons/fi';
import { notificationService } from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { createPortal } from 'react-dom';

const TYPE_CONFIG = {
  TASK_CREATED: { icon: FiCheckCircle, color: 'text-[var(--color-accent)]', bg: 'bg-[var(--color-surface-elevated)] border border-[var(--color-border)]' },
  TASK_COMPLETED: { icon: FiCheck, color: 'text-[var(--color-success)]', bg: 'bg-[var(--color-surface-elevated)] border border-[var(--color-border)]' },
  TASK_DELETED: { icon: FiTrash2, color: 'text-[var(--color-danger)]', bg: 'bg-[var(--color-surface-elevated)] border border-[var(--color-border)]' },
  AI_ANALYSIS: { icon: FiZap, color: 'text-[var(--color-purple)]', bg: 'bg-[var(--color-surface-elevated)] border border-[var(--color-border)]' },
  FOCUS_COMPLETED: { icon: FiClock, color: 'text-[var(--color-warning)]', bg: 'bg-[var(--color-surface-elevated)] border border-[var(--color-border)]' },
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ items: [], unread: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications(0, 30);
      setData(res);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  // Poll every 30 seconds for new notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate position when opening
  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPanelPos({
        top: rect.top,
        left: rect.right + 8,
      });
    }
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handler);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  const handleMarkRead = async (id) => {
    await notificationService.markAsRead(id);
    setData(prev => ({
      ...prev,
      unread: Math.max(0, prev.unread - 1),
      items: prev.items.map(n => n.id === id ? { ...n, is_read: 1 } : n)
    }));
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setData(prev => ({
      ...prev,
      unread: 0,
      items: prev.items.map(n => ({ ...n, is_read: 1 }))
    }));
  };

  const toggleOpen = () => {
    if (!open) {
      updatePosition();
      fetchNotifications();
    }
    setOpen(prev => !prev);
  };

  const dropdownPanel = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, x: -10, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            top: `${panelPos.top}px`,
            left: `${panelPos.left}px`,
            zIndex: 9999,
          }}
          className="w-80 sm:w-96 max-h-[70vh] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-md flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)]">
            <h3 className="font-semibold text-xs">Notifications</h3>
            <div className="flex items-center gap-2">
              {data.unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors font-semibold"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--color-text-primary)]/10 transition-colors text-[var(--color-text-secondary)]"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {loading && data.items.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : data.items.length === 0 ? (
              <div className="text-center py-12 text-[var(--color-text-muted)]">
                <FiBell size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              data.items.map((notif) => {
                const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.TASK_CREATED;
                const Icon = config.icon;
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] transition-colors cursor-pointer ${
                      notif.is_read === 0 ? 'bg-[var(--color-surface-elevated)]/60' : ''
                    }`}
                    onClick={() => { if (notif.is_read === 0) handleMarkRead(notif.id); }}
                  >
                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${config.bg} ${config.color}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold leading-tight ${notif.is_read === 0 ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                          {notif.title}
                        </p>
                        {notif.is_read === 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Bell Button */}
      <motion.button
        ref={buttonRef}
        whileTap={{ scale: 0.95 }}
        onClick={toggleOpen}
        className="relative p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)]/5 transition-colors"
        aria-label="Notifications"
      >
        <FiBell size={18} />
        <AnimatePresence>
          {data.unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-0.5 right-0.5 w-4 h-4 bg-[var(--color-danger)] text-white text-[9px] font-bold rounded-full flex items-center justify-center"
            >
              {data.unread > 9 ? '9+' : data.unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Render dropdown as a portal so it's not clipped by sidebar overflow */}
      {createPortal(dropdownPanel, document.body)}
    </>
  );
}
