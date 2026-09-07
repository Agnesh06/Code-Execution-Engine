import React from 'react';
import { Trophy, Medal, Award, Clock } from 'lucide-react';

export default function LeaderboardTable({ leaderboard = [], currentTeamId = null }) {
  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center border border-gray-800">
        <Trophy className="h-10 w-10 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400 font-medium">No teams on the leaderboard yet.</p>
        <p className="text-xs text-gray-500 mt-1">Scores will appear here automatically when teams submit correct answers.</p>
      </div>
    );
  }

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/40 shadow-sm shadow-amber-400/20">
            <Trophy className="h-4 w-4" />
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-300/20 text-slate-300 border border-slate-300/40">
            <Medal className="h-4 w-4" />
          </div>
        );
      case 3:
        return (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/40">
            <Award className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-800 text-gray-400 font-mono font-bold text-xs">
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
    <div className="overflow-hidden glass-panel rounded-xl border border-gray-800 shadow-xl">
      <table className="min-w-full divide-y divide-gray-800 text-left">
        <thead className="bg-[#0e1424] text-xs font-semibold uppercase tracking-wider text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-4 w-20">Rank</th>
            <th scope="col" className="px-6 py-4">Team</th>
            <th scope="col" className="px-6 py-4 text-right">Points</th>
            <th scope="col" className="px-6 py-4 text-right hidden sm:table-cell">Last Solved</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/60 font-medium">
          {leaderboard.map((entry) => {
            const isMyTeam = currentTeamId && entry.teamId === currentTeamId;
            return (
              <tr
                key={entry.teamId || entry.rank}
                className={`transition-colors ${
                  isMyTeam
                    ? 'bg-cyan-950/40 border-l-4 border-l-cyan-400 text-cyan-200'
                    : 'hover:bg-gray-800/40 text-gray-200'
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRankBadge(entry.rank)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">{entry.teamName}</span>
                    {isMyTeam && (
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        Your Team
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="font-mono text-lg font-bold text-amber-400">
                    {entry.score}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">pts</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-gray-400 font-mono hidden sm:table-cell">
                  <div className="flex items-center justify-end space-x-1">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span>{formatTime(entry.lastScoreUpdateAt)}</span>
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
