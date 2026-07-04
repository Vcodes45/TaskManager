import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUserPlus } from 'react-icons/fi';
import logo from '../assets/logo.jpg';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      // Route config in App.jsx auto-redirects when isAuthenticated becomes true
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
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
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">Create Account</h2>
          <p className="text-[var(--color-text-secondary)] text-xs">Get started with Kal Se today</p>
        </div>

        {error && (
          <div className="alert-danger mb-4">
            <span>{error}</span>
            <button onClick={() => setError('')}>&times;</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="registerName" className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
              Full Name
            </label>
            <input
              id="registerName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label htmlFor="registerEmail" className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
              Email
            </label>
            <input
              id="registerEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="registerPassword" className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
              Password
            </label>
            <input
              id="registerPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="registerConfirmPassword" className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
              Confirm Password
            </label>
            <input
              id="registerConfirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[var(--color-accent)] text-white font-semibold text-xs rounded-lg hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-sm"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-text-muted mt-4 mb-0">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent-hover font-semibold no-underline transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
