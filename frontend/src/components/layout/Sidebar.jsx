import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppStore } from '../../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, FiList, FiLayout, FiCalendar, FiPieChart, 
  FiClock, FiSettings, FiUser, FiInfo, FiLogOut, FiMenu, FiX, FiSun, FiMoon 
} from 'react-icons/fi';
import logo from '../../assets/logo.jpg';
import NotificationBell from './NotificationBell';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { isSidebarOpen, toggleSidebar, settings, updateSettings } = useAppStore();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: FiHome },
    { name: 'Kanban Board', path: '/kanban', icon: FiLayout },
    { name: 'Analytics', path: '/analytics', icon: FiPieChart },
    { name: 'Focus Mode', path: '/focus', icon: FiClock },
  ];

  const bottomItems = [
    { name: 'Settings', path: '/settings', icon: FiSettings },
    { name: 'Profile', path: '/profile', icon: FiUser },
    { name: 'About', path: '/about', icon: FiInfo },
  ];

  const NavLink = ({ item }) => {
    const isActive = location.pathname === item.path || 
                     (item.path !== '/' && location.pathname.startsWith(item.path));
    
    return (
      <Link
        to={item.path}
        className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-sm relative group
          ${isActive 
            ? 'text-[var(--color-text-primary)] font-semibold bg-[var(--color-surface)] border border-[var(--color-border)]' 
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)]/5'
          }`}
      >
        <item.icon className={`w-4 h-4 ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors'}`} />
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="whitespace-nowrap overflow-hidden"
            >
              {item.name}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface-elevated glass border border-[var(--color-border-light)] text-[var(--color-text-primary)]"
      >
        {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 240 : 72
        }}
        className={`fixed lg:sticky top-0 left-0 h-screen z-40 shrink-0
          bg-[var(--color-surface-elevated)] border-r border-[var(--color-border)] 
          flex flex-col justify-between py-6 px-3
          transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${!isSidebarOpen && 'lg:items-center'}`}
      >
        <div className="flex flex-col space-y-6">
          {/* App Brand Logo */}
          <div className={`flex items-center ${isSidebarOpen ? 'px-4 gap-3' : 'justify-center'} h-12`}>
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[var(--color-border-light)] shadow-sm">
              <img src={logo} alt="Kal Se Logo" className="w-full h-full object-cover" />
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight whitespace-nowrap overflow-hidden"
                >
                  Kal Se
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Area */}
          <div className={`flex items-center ${isSidebarOpen ? 'px-4' : 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-[var(--color-text-primary)] font-semibold text-sm shrink-0 border border-[var(--color-border)] shadow-sm">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="ml-3 text-sm font-medium text-[var(--color-text-secondary)] whitespace-nowrap overflow-hidden"
                >
                  {user?.name || 'User'}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Notification Bell */}
          <div className={`flex ${isSidebarOpen ? 'px-4' : 'justify-center'}`}>
            <NotificationBell />
          </div>

          {/* Main Navigation */}
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </nav>
        </div>

        {/* Bottom Navigation */}
        <div className="flex flex-col space-y-1.5 pt-6 border-t border-[var(--color-border)]">
          {bottomItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}

          <button
            onClick={() => updateSettings({ theme: settings?.theme === 'dark' ? 'light' : 'dark' })}
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)]/5 ${!isSidebarOpen && 'justify-center'}`}
          >
            {settings?.theme === 'dark' ? (
              <FiSun className="w-4 h-4 shrink-0 text-[var(--color-text-secondary)]" />
            ) : (
              <FiMoon className="w-4 h-4 shrink-0 text-[var(--color-text-secondary)]" />
            )}
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {settings?.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            onClick={logout}
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-sm text-[var(--color-danger)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-dim)] ${!isSidebarOpen && 'justify-center'}`}
          >
            <FiLogOut className="w-4 h-4 shrink-0" />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
      
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>
    </>
  );
}
