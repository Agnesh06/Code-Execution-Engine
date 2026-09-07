import React, { useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import LeaderboardTable from '../components/LeaderboardTable';
import { Trophy, Radio, RefreshCw } from 'lucide-react';

export default function Leaderboard() {
  const { leaderboard, isConnected, setLeaderboard } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    async function loadInitialLeaderboard() {
      try {
        const res = await api.getLeaderboard();
        if (Array.isArray(res.leaderboard)) {
          setLeaderboard(res.leaderboard);
        }
      } catch (err) {
        console.error('Failed to load initial leaderboard:', err);
      }
    }
    loadInitialLeaderboard();
  }, [setLeaderboard]);

  const manualRefresh = async () => {
    try {
      const res = await api.getLeaderboard();
      if (Array.isArray(res.leaderboard)) {
        setLeaderboard(res.leaderboard);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-amber-400" />
            <h1 className="text-3xl font-bold text-white font-['Outfit'] tracking-tight">
              Live Tournament Leaderboard
            </h1>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Real-time rankings sorted by total score and earliest completion time.
          </p>
        </div>

        {/* Real-time Status Indicator */}
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-mono border ${
            isConnected
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
              : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
          }`}>
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{isConnected ? 'LIVE WEBSOCKET' : 'CONNECTING...'}</span>
          </div>

          <button
            onClick={manualRefresh}
            title="Refresh Leaderboard"
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors border border-gray-700 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <LeaderboardTable
        leaderboard={leaderboard}
        currentTeamId={user?.team?._id || user?.team}
      />

    </div>
  );
}
