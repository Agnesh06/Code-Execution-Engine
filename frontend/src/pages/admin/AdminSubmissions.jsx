import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import AdminNav from './AdminNav';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const loadSubmissions = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.admin.getSubmissions({ page, limit: 15 });
      setSubmissions(res.submissions || []);
      setPagination(res.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to load submissions' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const formatTimestamp = (ts) => {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminNav
        title="Submissions Audit Feed"
        subtitle="Monitor live team submission attempts and automated evaluations (FR-11, SM-2)"
      />

      {/* Notifications */}
      {message && (
        <div className="mb-6 p-4 rounded-xl flex items-center justify-between bg-red-950/40 border border-red-500/40 text-red-300">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs hover:underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-cyan-400" />
          <span className="text-sm font-semibold text-white">All Submissions ({pagination.total})</span>
        </div>

        <button
          onClick={() => loadSubmissions(pagination.page)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 text-xs font-semibold cursor-pointer transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Submissions Table */}
      <div className="overflow-hidden glass-panel rounded-2xl border border-gray-800 mb-6 shadow-xl">
        <table className="min-w-full divide-y divide-gray-800 text-left">
          <thead className="bg-[#0e1424] text-xs font-semibold uppercase tracking-wider text-gray-400">
            <tr>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Team</th>
              <th className="px-6 py-3.5">Question</th>
              <th className="px-6 py-3.5">Submitted Answer</th>
              <th className="px-6 py-3.5 text-right">Points</th>
              <th className="px-6 py-3.5 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 font-medium text-xs sm:text-sm">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
                </td>
              </tr>
            ) : submissions.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No submission attempts recorded yet.
                </td>
              </tr>
            ) : (
              submissions.map((sub) => (
                <tr key={sub._id} className="hover:bg-gray-800/40 text-gray-200 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sub.isCorrect ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>CORRECT</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold font-mono">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>INCORRECT</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-white">
                    {sub.team?.name || 'Unknown Team'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300 font-medium">{sub.question?.title || 'Unknown Question'}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-400 max-w-xs truncate">
                    "{sub.answer}"
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold">
                    <span className={sub.pointsAwarded > 0 ? 'text-amber-400' : 'text-gray-500'}>
                      +{sub.pointsAwarded}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-400 font-mono text-xs">
                    <div className="flex items-center justify-end space-x-1">
                      <Clock className="h-3 w-3 text-gray-500" />
                      <span>{formatTimestamp(sub.timestamp)}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <div className="flex items-center space-x-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => loadSubmissions(pagination.page - 1)}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadSubmissions(pagination.page + 1)}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
