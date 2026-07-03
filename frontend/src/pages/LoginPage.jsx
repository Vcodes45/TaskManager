import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogIn } from 'react-icons/fi';

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
          <div className="w-12 h-12 rounded-xl bg-accent-dim flex items-center justify-center mx-auto mb-4">
            <FiLogIn className="text-accent text-xl" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-1">Welcome Back</h2>
          <p className="text-text-muted text-sm">Sign in to your TaskAI account</p>
        </div>

        {error && (
          <div className="alert-danger mb-4">
            <span>{error}</span>
            <button onClick={() => setError('')}>&times;</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="loginEmail" className="block text-sm font-medium text-text-secondary mb-1.5">
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
            <label htmlFor="loginPassword" className="block text-sm font-medium text-text-secondary mb-1.5">
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
            className="w-full py-2.5 rounded-lg bg-accent text-surface font-semibold text-sm hover:bg-accent-hover transition-all duration-200 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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
