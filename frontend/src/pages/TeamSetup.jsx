import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Users, PlusCircle, KeyRound, Copy, Check, ArrowRight } from 'lucide-react';

export default function TeamSetup() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newTeamName, setNewTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await api.getMyTeam();
        setTeam(res.team);
      } catch (err) {
        setTeam(null);
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setError('');
    if (!newTeamName.trim()) return;

    setActionLoading(true);
    try {
      const res = await api.createTeam(newTeamName.trim());
      setTeam(res.team);
      await refreshUser();
    } catch (err) {
      setError(err.message || 'Failed to create team');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setError('');
    if (!joinCode.trim()) return;

    setActionLoading(true);
    try {
      const res = await api.joinTeam(joinCode.trim());
      setTeam(res.team);
      await refreshUser();
    } catch (err) {
      setError(err.message || 'Failed to join team. Check the team code.');
    } finally {
      setActionLoading(false);
    }
  };

  const copyTeamCode = () => {
    if (team?.teamCode) {
      navigator.clipboard.writeText(team.teamCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-blueLight border-t-brand-blue" />
      </div>
    );
  }

  // ─── Already on a team ───────────────────────────────────
  if (team) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 relative z-10 animate-fade-in-up">
        <div className="card p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">

          {/* Team Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-brand-border">
            <div>
              <span className="badge badge-blue mb-2">Team Profile</span>
              <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-brand-navy to-brand-blue mt-1">{team.name}</h1>
            </div>

            {/* Team Code Card */}
            <div className="flex items-center gap-3 bg-slate-50 border border-brand-border rounded-xl px-4 py-3">
              <div>
                <div className="text-[10px] text-brand-muted uppercase tracking-wider font-semibold mb-0.5">Invite Code</div>
                <div className="text-xl font-mono font-bold text-brand-blue tracking-widest">{team.teamCode}</div>
              </div>
              <button
                onClick={copyTeamCode}
                className="p-2 rounded-lg bg-white hover:bg-brand-blueSoft border border-brand-border text-brand-muted hover:text-brand-blue transition-colors"
                title="Copy code to clipboard"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Members List */}
          <div className="py-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-muted mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-blue" />
              Team Members ({team.members?.length || 1})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {team.members?.map((member) => (
                <div
                  key={member._id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-brand-border flex items-center gap-3"
                >
                  <div className="h-9 w-9 rounded-full bg-brand-blue flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-brand-navy truncate">{member.name}</p>
                    <p className="text-xs text-brand-muted truncate">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-5 border-t border-brand-border flex justify-end">
            <button
              onClick={() => navigate('/arena')}
              className="btn-primary"
            >
              <span>Enter Competition Arena</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── No team yet ─────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative z-10 animate-fade-in-up">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-brand-navy to-brand-blue">Team Setup</h1>
        <p className="text-brand-muted text-base mt-3 max-w-md mx-auto">
          Competitions are team-based. Create a new team or join an existing one using their 6-character code.
        </p>
      </div>

      {error && (
        <div className="max-w-md mx-auto mb-8 alert-error animate-fade-in">
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Create Team Card */}
        <div className="card p-8 flex flex-col gap-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div>
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-brand-blueSoft mb-4">
              <PlusCircle className="h-7 w-7 text-brand-blue" />
            </div>
            <h2 className="text-2xl font-bold text-brand-navy">Create a New Team</h2>
            <p className="text-sm text-brand-muted mt-1.5">
              Found a new team. You'll receive a unique Team Code to share with your teammates.
            </p>
          </div>
          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">
                Team Name
              </label>
              <input
                type="text"
                required
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g. Cyber Ninjas"
                className="input-field"
              />
            </div>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-primary w-full !rounded-xl"
            >
              {actionLoading ? 'Creating...' : 'Create Team'}
            </button>
          </form>
        </div>

        {/* Join Team Card */}
        <div className="card p-8 flex flex-col gap-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div>
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-violet-50 mb-4">
              <KeyRound className="h-7 w-7 text-brand-violet" />
            </div>
            <h2 className="text-2xl font-bold text-brand-navy">Join Existing Team</h2>
            <p className="text-sm text-brand-muted mt-1.5">
              Enter the 6-character Team Code provided by your team captain to join their roster.
            </p>
          </div>
          <form onSubmit={handleJoinTeam} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">
                Team Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. CYBER9"
                className="input-field font-mono tracking-widest uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-primary w-full !rounded-xl"
            >
              {actionLoading ? 'Joining...' : 'Join Team'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
