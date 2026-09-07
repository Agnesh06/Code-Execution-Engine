import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Shield, LogOut, Swords, Users, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
      isActive(path)
        ? 'bg-blue-50 text-brand-blue'
        : 'text-brand-muted hover:text-brand-navy hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-blueLight shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-violet flex items-center justify-center shadow-blue transform group-hover:scale-105 transition-transform">
            <Trophy className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <span className="block text-xl font-extrabold font-display text-brand-navy tracking-tight group-hover:text-brand-blue transition-colors">
              Quiz<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-violet">Arena</span>
            </span>
            <span className="hidden sm:block text-[10px] font-medium text-brand-muted -mt-0.5">
              Live Competition Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        {user && (
          <nav className="hidden md:flex items-center gap-1">
            {user.role === 'ADMIN' ? (
              <Link to="/admin" className={navLinkClass('/admin')}>
                <Shield className="h-4 w-4" />
                Admin Console
              </Link>
            ) : (
              <>
                <Link to="/arena" className={navLinkClass('/arena')}>
                  <Swords className="h-4 w-4" />
                  Arena
                </Link>
                <Link to="/team-setup" className={navLinkClass('/team-setup')}>
                  <Users className="h-4 w-4" />
                  Team
                </Link>
              </>
            )}
            <Link to="/leaderboard" className={navLinkClass('/leaderboard')}>
              <Trophy className="h-4 w-4" />
              Leaderboard
            </Link>
          </nav>
        )}

        {/* Right: Auth / User Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* User Info */}
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold text-brand-navy leading-tight">{user.name}</span>
                <span className="text-[10px] font-medium text-brand-muted uppercase tracking-wider">
                  {user.role}{user.team ? ` · ${user.team.name || 'Team Member'}` : ''}
                </span>
              </div>
              {/* Avatar circle */}
              <div className="h-8 w-8 rounded-full bg-brand-blue flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              {/* Logout */}
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-lg text-brand-muted hover:text-red-500 hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
              >
                <LogOut className="h-4 w-4" />
              </button>
              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-lg text-brand-muted hover:bg-slate-100 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-brand-muted hover:text-brand-navy px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link to="/register" className="btn-primary text-sm !px-5 !py-2 !rounded-lg">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {user && mobileOpen && (
        <div className="md:hidden border-t border-brand-border bg-white px-4 py-3 space-y-1 animate-slide-up">
          {user.role === 'ADMIN' ? (
            <Link to="/admin" onClick={() => setMobileOpen(false)} className={navLinkClass('/admin')}>
              <Shield className="h-4 w-4" /> Admin Console
            </Link>
          ) : (
            <>
              <Link to="/arena" onClick={() => setMobileOpen(false)} className={navLinkClass('/arena')}>
                <Swords className="h-4 w-4" /> Arena
              </Link>
              <Link to="/team-setup" onClick={() => setMobileOpen(false)} className={navLinkClass('/team-setup')}>
                <Users className="h-4 w-4" /> Team
              </Link>
            </>
          )}
          <Link to="/leaderboard" onClick={() => setMobileOpen(false)} className={navLinkClass('/leaderboard')}>
            <Trophy className="h-4 w-4" /> Leaderboard
          </Link>
          <div className="pt-2 border-t border-brand-border mt-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-navy">{user.name}</p>
              <p className="text-xs text-brand-muted">{user.role}</p>
            </div>
            <button onClick={handleLogout} className="btn-ghost text-red-500 hover:bg-red-50 !px-3 !py-1.5">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
