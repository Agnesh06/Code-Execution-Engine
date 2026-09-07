import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import AdminNav from './AdminNav';
import {
  Users,
  UserX,
  Trophy,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  X,
  Award
} from 'lucide-react';

export default function AdminTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Team detail / progress modal
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamProgress, setTeamProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getTeams();
      setTeams(res.teams || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to load teams' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleRemoveMember = async (teamId, userId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this team?`)) return;
    try {
      await api.admin.removeTeamMember(teamId, userId);
      setMessage({ type: 'success', text: `Removed ${memberName} from team` });
      await loadTeams();
      if (selectedTeam && selectedTeam._id === teamId) {
        handleViewProgress(selectedTeam);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleViewProgress = async (team) => {
    setSelectedTeam(team);
    setProgressLoading(true);
    try {
      const res = await api.admin.getTeamProgress(team._id);
      setTeamProgress(res);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to load team progress' });
    } finally {
      setProgressLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminNav
        title="Teams Management"
        subtitle="Inspect registered teams, manage membership, and view team progress (FR-12, SM-1)"
      />

      {/* Notifications */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center justify-between ${
          message.type === 'error'
            ? 'bg-red-950/40 border border-red-500/40 text-red-300'
            : 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs hover:underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Teams Grid / Table */}
      <div className="overflow-hidden glass-panel rounded-2xl border border-gray-800 shadow-xl">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-violet-400" />
            <h2 className="text-lg font-bold text-white">Registered Teams ({teams.length})</h2>
          </div>
        </div>

        <div className="divide-y divide-gray-800">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          ) : teams.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No teams created yet. Participants can form teams from the Participant Portal.
            </div>
          ) : (
            teams.map((tm) => (
              <div key={tm._id} className="p-6 hover:bg-gray-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-bold text-white">{tm.name}</h3>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      Code: {tm.teamCode}
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30 flex items-center space-x-1">
                      <Trophy className="h-3.5 w-3.5" />
                      <span>{tm.totalScore} pts</span>
                    </span>
                  </div>

                  {/* Members list */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-gray-400 font-semibold">Members ({tm.members?.length || 0}):</span>
                    {tm.members?.map((m) => (
                      <span
                        key={m._id}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-gray-800/80 border border-gray-700 text-xs text-gray-200"
                      >
                        <span>{m.name}</span>
                        <button
                          onClick={() => handleRemoveMember(tm._id, m._id, m.name)}
                          title="Remove member"
                          className="text-gray-400 hover:text-red-400 cursor-pointer ml-1"
                        >
                          <UserX className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleViewProgress(tm)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 text-xs font-bold cursor-pointer transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Progress</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Team Progress Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#10172a] border border-gray-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedTeam(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-1 flex items-center space-x-2">
              <Users className="h-5 w-5 text-violet-400" />
              <span>{selectedTeam.name} — Progress</span>
            </h2>
            <p className="text-xs text-gray-400 mb-4 font-mono">Team Code: {selectedTeam.teamCode}</p>

            {progressLoading ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            ) : teamProgress ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-800 text-center">
                    <span className="text-[10px] uppercase font-mono text-gray-400 block">Total Score</span>
                    <span className="text-lg font-bold text-amber-400 font-mono">{teamProgress.team.score}</span>
                  </div>
                  <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-800 text-center">
                    <span className="text-[10px] uppercase font-mono text-gray-400 block">Attempts</span>
                    <span className="text-lg font-bold text-cyan-400 font-mono">{teamProgress.stats?.totalSubmissions || 0}</span>
                  </div>
                  <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-800 text-center">
                    <span className="text-[10px] uppercase font-mono text-gray-400 block">Solved Qs</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">{teamProgress.questionStatuses?.length || 0}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Solved Questions</h3>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {teamProgress.questionStatuses?.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No questions solved yet.</p>
                    ) : (
                      teamProgress.questionStatuses?.map((qs, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-900/40 border border-gray-800 text-xs">
                          <span className="text-white font-medium">{qs.question?.title || 'Question'}</span>
                          <span className="font-mono text-emerald-400">+{qs.question?.points || 0} pts</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">No progress data found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
