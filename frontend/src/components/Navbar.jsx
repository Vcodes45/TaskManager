import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiCheckSquare, FiLogOut, FiHome, FiPlus, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import logo from '../assets/logo.jpg';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`nav-glass fixed top-0 left-0 right-0 z-50 ${scrolled ? 'scrolled' : ''}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <img src={logo} alt="Kal Se Logo" className="h-8 w-8 rounded-lg object-cover" />
            <span className="text-text-primary font-bold text-lg tracking-tight">Kal Se</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-[var(--color-accent-dim)] text-sm font-medium transition-all duration-200 no-underline"
                >
                  <FiHome size={15} /> Dashboard
                </Link>
                <Link
                  to="/tasks/new"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-[var(--color-accent-dim)] text-sm font-medium transition-all duration-200 no-underline"
                >
                  <FiPlus size={15} /> New Task
                </Link>
              </>
            ) : (
              <span className="text-text-muted text-sm">AI-Powered Task Management</span>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <span className="toggle-knob">
                {theme === 'dark' ? <FiMoon size={11} /> : <FiSun size={11} />}
              </span>
            </button>

            {isAuthenticated ? (
              <>
                <span className="text-text-secondary text-sm font-medium">
                  Hi, {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-light text-text-secondary hover:text-text-primary hover:bg-[var(--color-accent-dim)] text-sm font-medium transition-all duration-200 cursor-pointer bg-transparent"
                >
                  <FiLogOut size={14} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors no-underline"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-lg bg-accent text-surface font-semibold text-sm hover:bg-accent-hover transition-colors no-underline"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile right side */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <span className="toggle-knob">
                {theme === 'dark' ? <FiMoon size={11} /> : <FiSun size={11} />}
              </span>
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-text-secondary hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer"
            >
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-1">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-[var(--color-accent-dim)] text-sm font-medium no-underline"
                  >
                    <FiHome size={15} /> Dashboard
                  </Link>
                  <Link
                    to="/tasks/new"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-[var(--color-accent-dim)] text-sm font-medium no-underline"
                  >
                    <FiPlus size={15} /> New Task
                  </Link>
                  <div className="border-t border-border my-2" />
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-text-secondary text-sm">Hi, {user?.name}</span>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-light text-text-secondary hover:text-text-primary text-sm bg-transparent cursor-pointer"
                    >
                      <FiLogOut size={14} /> Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 text-text-secondary hover:text-text-primary text-sm font-medium no-underline"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 text-accent hover:text-accent-hover text-sm font-semibold no-underline"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
