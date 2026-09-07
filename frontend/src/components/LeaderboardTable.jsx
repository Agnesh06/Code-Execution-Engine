import React from 'react';
import { Trophy, Medal, Award, Clock } from 'lucide-react';

export default function LeaderboardTable({ leaderboard = [], currentTeamId = null }) {
  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="h-14 w-14 rounded-full bg-brand-blueSoft flex items-center justify-center mx-auto mb-4">
          <Trophy className="h-7 w-7 text-brand-blue" />
        </div>
        <p className="font-semibold text-brand-navy">No teams on the leaderboard yet.</p>
        <p className="text-sm text-brand-muted mt-1">
          Scores will appear here automatically when teams submit correct answers.
        </p>
      </div>
    );
  }

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-amber-50 text-amber-500 border border-amber-200 shadow-sm">
            <Trophy className="h-4 w-4" />
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            <Medal className="h-4 w-4" />
          </div>
        );
      case 3:
        return (
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-orange-50 text-orange-500 border border-orange-200">
            <Award className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-slate-50 text-brand-muted border border-brand-border font-bold text-xs font-mono">
            #{rank}
          </div>
        );
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '—';
    }
  };

  return (
    <div className="card overflow-hidden">
      <table className="min-w-full divide-y divide-brand-border text-left">
        <thead>
          <tr className="bg-slate-50">
            <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-brand-muted w-20">Rank</th>
            <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-brand-muted">Team</th>
            <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-brand-muted text-right">Points</th>
            <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-brand-muted text-right hidden sm:table-cell">Last Solved</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border bg-white">
          {leaderboard.map((entry) => {
            const isMyTeam = currentTeamId && entry.teamId === currentTeamId;
            return (
              <tr
                key={entry.teamId || entry.rank}
                className={`transition-colors ${
                  isMyTeam
                    ? 'bg-blue-50 border-l-4 border-l-brand-blue'
                    : 'hover:bg-slate-50'
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRankBadge(entry.rank)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-brand-navy">{entry.teamName}</span>
                    {isMyTeam && (
                      <span className="badge badge-blue">Your Team</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="font-mono text-lg font-bold text-brand-blue">
                    {entry.score}
                  </span>
                  <span className="text-xs text-brand-muted ml-1">pts</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right hidden sm:table-cell">
                  <div className="flex items-center justify-end gap-1.5 text-xs text-brand-muted">
                    <Clock className="h-3 w-3" />
                    <span className="font-mono">{formatTime(entry.lastScoreUpdateAt)}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
