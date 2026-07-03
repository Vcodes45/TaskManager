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
    <div className="parallax-auth min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1920&q=80')" }}>

      {/* Floating decorative images */}
      <div className="auth-decoration auth-deco-1">
        <img
          src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&q=75"
          alt=""
          loading="lazy"
        />
      </div>
      <div className="auth-decoration auth-deco-2">
        <img
          src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&q=75"
          alt=""
          loading="lazy"
        />
      </div>
      <div className="auth-decoration auth-deco-3">
        <img
          src="https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=400&q=75"
          alt=""
          loading="lazy"
        />
      </div>

      <div className="glass-strong rounded-2xl w-full max-w-sm p-8 animate-fade-in relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-accent-dim flex items-center justify-center mx-auto mb-4 border border-[var(--color-border-light)] shadow-sm">
            <img src={logo} alt="Kal Se Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-1">Create Account</h2>
          <p className="text-text-muted text-sm">Get started with Kal Se today</p>
        </div>

        {error && (
          <div className="alert-danger mb-4">
            <span>{error}</span>
            <button onClick={() => setError('')}>&times;</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="registerName" className="block text-sm font-medium text-text-secondary mb-1.5">
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
            <label htmlFor="registerEmail" className="block text-sm font-medium text-text-secondary mb-1.5">
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
            <label htmlFor="registerPassword" className="block text-sm font-medium text-text-secondary mb-1.5">
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
            <label htmlFor="registerConfirmPassword" className="block text-sm font-medium text-text-secondary mb-1.5">
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
            className="w-full py-2.5 rounded-lg bg-accent text-surface font-semibold text-sm hover:bg-accent-hover transition-all duration-200 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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
