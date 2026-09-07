import React, { useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import LeaderboardTable from '../components/LeaderboardTable';
import { Trophy, RefreshCw, Wifi, WifiOff } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 animate-fade-in-up">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-brand-amberBg flex items-center justify-center shadow-sm">
              <Trophy className="h-6 w-6 text-brand-amber" />
            </div>
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-brand-amber to-brand-orange">
              Live Leaderboard
            </h1>
          </div>
          <p className="text-base text-brand-muted pl-16">
            Real-time rankings sorted by total score and earliest completion time.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Connection Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
            isConnected
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {isConnected ? (
              <><span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /><Wifi className="h-3 w-3" /> Live</>
            ) : (
              <><span className="h-2 w-2 rounded-full bg-amber-500" /><WifiOff className="h-3 w-3" /> Connecting</>
            )}
          </div>

          {/* Refresh */}
          <button
            id="leaderboard-refresh"
            onClick={manualRefresh}
            title="Refresh Leaderboard"
            className="btn-secondary !rounded-lg !px-3 !py-2"
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
