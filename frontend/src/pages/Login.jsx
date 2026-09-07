import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Shield, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (!user.team) {
        navigate('/team-setup');
      } else {
        navigate('/arena');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setEmail('admin@example.com');
    setPassword('ChangeMe123!');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative z-10">
      <div className="max-w-md w-full">

        {/* Logo mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-brand-blue shadow-blue mb-4">
            <Trophy className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-brand-navy">
            Welcome back
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Sign in to participate or manage live competitions
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">

          {/* Demo Fill Button */}
          <button
            type="button"
            id="demo-admin-fill"
            onClick={fillAdmin}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 mb-6 bg-brand-blueSoft border border-brand-blueLight text-brand-blue text-sm font-medium rounded-xl hover:bg-brand-blueLight transition-colors"
          >
            <Shield className="h-4 w-4" />
            Fill Demo Admin Credentials
          </button>

          {/* Error Alert */}
          {error && (
            <div className="alert-error mb-5 animate-fade-in">
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-brand-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-brand-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full !rounded-xl mt-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-brand-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-blue font-semibold hover:text-brand-navy transition-colors">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
