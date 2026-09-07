import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Users, PlusCircle, KeyRound, Copy, Check, ArrowRight, ShieldCheck } from 'lucide-react';

export default function TeamSetup() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
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
        // Not on a team yet
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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // If user already on a team, display team dashboard card
  if (team) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="glass-panel rounded-2xl p-8 border border-cyan-500/30 shadow-2xl">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">Team Profile</span>
              <h1 className="text-3xl font-bold text-white font-['Outfit'] mt-1">{team.name}</h1>
            </div>

            {/* Team Join Code Share Card */}
            <div className="bg-gray-900/90 border border-gray-700 rounded-xl p-3 flex items-center space-x-3">
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Invite Team Code</div>
                <div className="text-lg font-mono font-bold text-cyan-300 tracking-wider">{team.teamCode}</div>
              </div>
              <button
                onClick={copyTeamCode}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700 cursor-pointer"
                title="Copy code to clipboard"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Members List */}
          <div className="py-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4 flex items-center space-x-2">
              <Users className="h-4 w-4 text-violet-400" />
              <span>Team Members ({team.members?.length || 1})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {team.members?.map((member) => (
                <div
                  key={member._id}
                  className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center space-x-3"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-600 to-violet-600 flex items-center justify-center font-bold text-xs text-white">
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-white truncate">{member.name}</p>
                    <p className="text-xs text-gray-500 truncate">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enter Arena Action */}
          <div className="pt-6 border-t border-gray-800 flex justify-end">
            <button
              onClick={() => navigate('/arena')}
              className="flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              <span>Enter Competition Arena</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Not on a team: provide Create and Join forms
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white font-['Outfit'] tracking-tight">Team Setup</h1>
        <p className="text-gray-400 text-sm mt-2">
          Competitions are team-based. Create a new team or join an existing team using their 6-character code.
        </p>
      </div>

      {error && (
        <div className="max-w-md mx-auto mb-8 p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-sm text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Create Team Card */}
        <div className="glass-panel rounded-2xl p-8 border border-gray-800 flex flex-col justify-between">
          <div>
            <div className="p-3 w-fit rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
              <PlusCircle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 font-['Outfit']">Create a New Team</h2>
            <p className="text-sm text-gray-400 mb-6">
              Found a new team. You will receive a unique Team Code to share with your teammates.
            </p>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Cyber Ninjas"
                  className="w-full px-4 py-2.5 bg-gray-900/90 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-md transition-all text-sm cursor-pointer"
              >
                {actionLoading ? 'Creating Team...' : 'Create Team'}
              </button>
            </form>
          </div>
        </div>

        {/* Join Team Card */}
        <div className="glass-panel rounded-2xl p-8 border border-gray-800 flex flex-col justify-between">
          <div>
            <div className="p-3 w-fit rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-4">
              <KeyRound className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 font-['Outfit']">Join Existing Team</h2>
            <p className="text-sm text-gray-400 mb-6">
              Enter the 6-character Team Code provided by your team captain to join their roster.
            </p>

            <form onSubmit={handleJoinTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  6-Character Team Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CYBER9"
                  className="w-full px-4 py-2.5 bg-gray-900/90 border border-gray-700 rounded-xl text-white placeholder-gray-500 font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-md transition-all text-sm cursor-pointer"
              >
                {actionLoading ? 'Joining Team...' : 'Join Team'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
