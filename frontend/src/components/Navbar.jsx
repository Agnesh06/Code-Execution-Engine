import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Shield, User, LogOut, Swords, Users } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="border-b border-gray-800 bg-[#0e1322]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <Link to="/" className="text-xl font-bold font-['Outfit'] tracking-tight bg-gradient-to-r from-cyan-400 via-sky-200 to-violet-400 bg-clip-text text-transparent">
              CYBER<span className="text-white">QUIZ</span>
            </Link>
            <span className="hidden sm:inline-block ml-2 text-[10px] tracking-widest uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/60">
              Live Competition
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-1 sm:space-x-4 text-sm font-medium">
          {user ? (
            <>
              {user.role === 'ADMIN' ? (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    isActive('/admin')
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                  }`}
                >
                  <Shield className="h-4 w-4 text-cyan-400" />
                  <span>Admin Console</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/arena"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                      isActive('/arena')
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                    }`}
                  >
                    <Swords className="h-4 w-4 text-cyan-400" />
                    <span>Arena</span>
                  </Link>
                  <Link
                    to="/team-setup"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                      isActive('/team-setup')
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                    }`}
                  >
                    <Users className="h-4 w-4 text-violet-400" />
                    <span>Team</span>
                  </Link>
                </>
              )}

              <Link
                to="/leaderboard"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  isActive('/leaderboard')
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <Trophy className="h-4 w-4 text-amber-400" />
                <span>Leaderboard</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white px-3 py-1.5">
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium px-4 py-1.5 rounded-lg shadow-md transition-all"
              >
                Register
              </Link>
            </>
          )}
        </nav>

        {/* User Badge & Logout */}
        {user && (
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-semibold text-gray-200">{user.name}</span>
              <span className="text-[10px] uppercase tracking-wider font-mono text-cyan-400">
                {user.role} {user.team ? `• Team ${user.team.name || 'Member'}` : ''}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors border border-transparent hover:border-rose-900/40"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}

      </div>
    </header>
  );
}
