import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Shield, User, Lock, Mail, ArrowRight } from 'lucide-react';

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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-panel rounded-2xl p-8 border border-gray-800 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3 shadow-lg shadow-cyan-500/10">
            <Trophy className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-['Outfit']">
            Welcome to CyberQuiz
          </h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to participate or manage live competitions</p>
        </div>

        {/* Demo Fast-Fill Buttons */}
        <div className="grid grid-cols-1 gap-2 mb-6">
          <button
            type="button"
            onClick={fillAdmin}
            className="flex items-center justify-center space-x-2 py-2 px-3 bg-gray-800/60 hover:bg-gray-800 border border-cyan-500/30 text-xs text-cyan-300 rounded-lg transition-colors"
          >
            <Shield className="h-3.5 w-3.5 text-cyan-400" />
            <span>Fast Fill: Demo Tournament Admin</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-gray-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/90 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 text-gray-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/90 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2 text-sm"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          Don't have a team account yet?{' '}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
}
