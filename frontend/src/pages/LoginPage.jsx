import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogIn } from 'react-icons/fi';
import logo from '../assets/logo.jpg';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // Route config in App.jsx auto-redirects when isAuthenticated becomes true
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-surface-elevated)]">



      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] rounded-xl w-full max-w-sm p-8 relative z-10 shadow-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center mx-auto mb-4 border border-[var(--color-border)] shadow-sm">
            <img src={logo} alt="Kal Se Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">Welcome Back</h2>
          <p className="text-[var(--color-text-secondary)] text-xs">Sign in to your Kal Se account</p>
        </div>

        {error && (
          <div className="alert-danger mb-4">
            <span>{error}</span>
            <button onClick={() => setError('')}>&times;</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="loginEmail" className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
              Email
            </label>
            <input
              id="loginEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="loginPassword" className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
              Password
            </label>
            <input
              id="loginPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[var(--color-accent)] text-white font-semibold text-xs rounded-lg hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-sm"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-sm text-text-muted mt-4 mb-0">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-accent hover:text-accent-hover font-semibold no-underline transition-colors">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
