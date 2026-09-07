import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  Shield,
  Layers,
  HelpCircle,
  Users,
  FileText,
  Play,
  Square,
  Unlock,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('rounds'); // 'rounds' | 'questions' | 'teams' | 'submissions'

  // Data states
  const [event, setEvent] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Forms
  const [newRoundName, setNewRoundName] = useState('');
  const [newRoundOrder, setNewRoundOrder] = useState(2);

  const [newQTitle, setNewQTitle] = useState('');
  const [newQDesc, setNewQDesc] = useState('');
  const [newQType, setNewQType] = useState('MCQ');
  const [newQOptions, setNewQOptions] = useState('Option A, Option B, Option C, Option D');
  const [newQAnswer, setNewQAnswer] = useState('');
  const [newQPoints, setNewQPoints] = useState(20);
  const [newQOrder, setNewQOrder] = useState(1);
  const [newQRoundId, setNewQRoundId] = useState('');

  // Manual unlock modal/state
  const [selectedTeamForUnlock, setSelectedTeamForUnlock] = useState(null);
  const [unlockQuestionId, setUnlockQuestionId] = useState('');

  const loadAll = async () => {
    try {
      setLoading(true);
      const [evRes, rdRes, qRes, tmRes, subRes] = await Promise.all([
        api.getCurrentEvent(),
        api.getCurrentRound(),
        api.admin.getQuestions({ limit: 50 }),
        api.admin.getTeams(),
        api.admin.getSubmissions({ limit: 50 })
      ]);

      setEvent(evRes.event);
      // Fetch all rounds if available or set round
      setRounds(rdRes.round ? [rdRes.round] : []);
      setQuestions(qRes.questions || []);
      setTeams(tmRes.teams || []);
      setSubmissions(subRes.submissions || []);

      if (rdRes.round) {
        setNewQRoundId(rdRes.round._id);
      }
    } catch (err) {
      console.error('Failed to load admin portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const showNotification = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Event & Round actions
  const handleStartEvent = async () => {
    if (!event) return;
    try {
      const res = await api.admin.startEvent(event._id);
      setEvent(res.event);
      showNotification('Event status set to ACTIVE');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleEndEvent = async () => {
    if (!event) return;
    try {
      const res = await api.admin.endEvent(event._id);
      setEvent(res.event);
      showNotification('Event ended successfully');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleOpenRound = async (roundId) => {
    try {
      await api.admin.openRound(roundId);
      showNotification('Round OPENED - Question #1 exposed to participants');
      await loadAll();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleCloseRound = async (roundId) => {
    try {
      await api.admin.closeRound(roundId);
      showNotification('Round CLOSED');
      await loadAll();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleCreateRound = async (e) => {
    e.preventDefault();
    if (!event) return;
    try {
      await api.admin.createRound(event._id, newRoundName, newRoundOrder);
      setNewRoundName('');
      setNewRoundOrder((prev) => prev + 1);
      showNotification('New round created');
      await loadAll();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Question CRUD
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!newQRoundId) {
      showNotification('Please select a valid round for the question', 'error');
      return;
    }

    try {
      const payload = {
        roundId: newQRoundId,
        title: newQTitle.trim(),
        description: newQDesc.trim(),
        type: newQType,
        correctAnswer: newQAnswer.trim(),
        points: Number(newQPoints),
        unlockOrder: Number(newQOrder)
      };

      if (newQType === 'MCQ') {
        payload.options = newQOptions.split(',').map((o) => o.trim()).filter(Boolean);
      }

      await api.admin.createQuestion(payload);
      setNewQTitle('');
      setNewQDesc('');
      setNewQAnswer('');
      setNewQOrder((prev) => prev + 1);
      showNotification('Question created successfully');
      await loadAll();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.admin.deleteQuestion(id);
      showNotification('Question deleted');
      await loadAll();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Manual Unlock Action (RC-3, S16)
  const handleManualUnlock = async (e) => {
    e.preventDefault();
    if (!selectedTeamForUnlock || !unlockQuestionId) return;

    try {
      await api.admin.manualUnlockQuestion(selectedTeamForUnlock._id, unlockQuestionId);
      showNotification(`Manually unlocked question for ${selectedTeamForUnlock.name}!`);
      setSelectedTeamForUnlock(null);
      setUnlockQuestionId('');
      await loadAll();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white font-['Outfit'] tracking-tight">
              Admin Command Center
            </h1>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Tournament rounds control, questions management, team status, and manual unlock overrides.
          </p>
        </div>

        {/* Global Notification Banner */}
        {message && (
          <div className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Single Unified Tab Navigation Bar */}
      <div className="flex border-b border-gray-800 space-x-1 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('rounds')}
          className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'rounds'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Event & Rounds</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'questions'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Questions CRUD ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'teams'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Teams & Manual Unlock ({teams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'submissions'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Submissions Feed ({submissions.length})</span>
        </button>
      </div>

      {/* TAB 1: EVENT & ROUNDS */}
      {activeTab === 'rounds' && (
        <div className="space-y-8">
          
          {/* Event Status Control */}
          <div className="glass-panel rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-bold text-white mb-3">Event Lifecycle</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{event?.name || 'No Event Created'}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">Status: <span className="text-cyan-400">{event?.status}</span></p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleStartEvent}
                  disabled={event?.status === 'ACTIVE'}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Start Event (ACTIVE)</span>
                </button>
                <button
                  onClick={handleEndEvent}
                  disabled={event?.status === 'ENDED'}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
                >
                  <Square className="h-3.5 w-3.5" />
                  <span>End Event (ENDED)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Rounds List & Controls */}
          <div className="glass-panel rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-bold text-white mb-4">Rounds Control (RC-1, RC-2)</h2>
            <div className="space-y-4">
              {rounds.map((r) => (
                <div key={r._id} className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono uppercase text-gray-400">Round #{r.order}</span>
                    <h3 className="text-base font-bold text-white">{r.name}</h3>
                    <span className={`inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded ${
                      r.status === 'OPEN'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-gray-800 text-gray-400'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenRound(r._id)}
                      disabled={r.status === 'OPEN'}
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-medium cursor-pointer"
                    >
                      Open Round
                    </button>
                    <button
                      onClick={() => handleCloseRound(r._id)}
                      disabled={r.status === 'CLOSED'}
                      className="px-3.5 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white text-xs font-medium cursor-pointer"
                    >
                      Close Round
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Create Round Inline Form */}
            <form onSubmit={handleCreateRound} className="mt-6 pt-6 border-t border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Round Name (e.g. Round 2: Riddles)"
                value={newRoundName}
                onChange={(e) => setNewRoundName(e.target.value)}
                className="px-3.5 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white text-xs"
              />
              <input
                type="number"
                required
                min={1}
                placeholder="Order"
                value={newRoundOrder}
                onChange={(e) => setNewRoundOrder(e.target.value)}
                className="px-3.5 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-xs font-semibold hover:from-cyan-500 hover:to-blue-500"
              >
                + Create Round
              </button>
            </form>
          </div>

        </div>
      )}

      {/* TAB 2: QUESTIONS CRUD */}
      {activeTab === 'questions' && (
        <div className="space-y-8">
          
          {/* Create Question Form */}
          <div className="glass-panel rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Plus className="h-5 w-5 text-cyan-400" />
              <span>Create New Question</span>
            </h2>

            <form onSubmit={handleCreateQuestion} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Question Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyber Trivia #1"
                  value={newQTitle}
                  onChange={(e) => setNewQTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Description / Question Text</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter the full question or riddle text..."
                  value={newQDesc}
                  onChange={(e) => setNewQDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Question Type</label>
                <select
                  value={newQType}
                  onChange={(e) => setNewQType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white text-xs"
                >
                  <option value="MCQ">MCQ (Multiple Choice)</option>
                  <option value="RIDDLE">RIDDLE (Open Text Answer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Points Awarded</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={newQPoints}
                  onChange={(e) => setNewQPoints(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Unlock Order (PU-1)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={newQOrder}
                  onChange={(e) => setNewQOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Target Round</label>
                <select
                  value={newQRoundId}
                  onChange={(e) => setNewQRoundId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white text-xs"
                >
                  {rounds.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name} (Order {r.order})
                    </option>
                  ))}
                </select>
              </div>

              {newQType === 'MCQ' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">MCQ Options (comma-separated)</label>
                  <input
                    type="text"
                    required
                    placeholder="Option 1, Option 2, Option 3, Option 4"
                    value={newQOptions}
                    onChange={(e) => setNewQOptions(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white text-xs"
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Correct Answer (Exact Match for MCQ, Normalized for Riddle)</label>
                <input
                  type="text"
                  required
                  placeholder="Expected correct answer"
                  value={newQAnswer}
                  onChange={(e) => setNewQAnswer(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl text-xs shadow-md hover:from-cyan-400 hover:to-blue-500"
                >
                  Add Question
                </button>
              </div>
            </form>
          </div>

          {/* Existing Questions List */}
          <div className="glass-panel rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-bold text-white mb-4">Active Question Catalog</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800 text-left text-xs">
                <thead className="bg-gray-900/80 text-gray-400 uppercase font-mono">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Points</th>
                    <th className="px-4 py-3">Correct Answer</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-gray-300">
                  {questions.map((q) => (
                    <tr key={q._id} className="hover:bg-gray-800/30">
                      <td className="px-4 py-3 font-mono font-bold text-cyan-400">#{q.unlockOrder}</td>
                      <td className="px-4 py-3 font-semibold text-white">{q.title}</td>
                      <td className="px-4 py-3 font-mono">{q.type}</td>
                      <td className="px-4 py-3 font-mono text-amber-400">{q.points}</td>
                      <td className="px-4 py-3 font-mono text-emerald-400">{q.correctAnswer}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteQuestion(q._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-950/20"
                          title="Delete Question"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: TEAMS & MANUAL UNLOCK */}
      {activeTab === 'teams' && (
        <div className="space-y-8">
          
          {/* Manual Unlock Modal Popup if triggered */}
          {selectedTeamForUnlock && (
            <div className="glass-panel-glow rounded-2xl p-6 border border-cyan-500/40 mb-6 animate-fade-in">
              <h3 className="text-base font-bold text-white mb-2 flex items-center space-x-2">
                <Unlock className="h-4 w-4 text-cyan-400" />
                <span>Manual Question Unlock Override (RC-3, S16)</span>
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Unlocking a question for team <strong className="text-white">{selectedTeamForUnlock.name}</strong> will make the question immediately visible to them without marking it as solved or awarding points.
              </p>

              <form onSubmit={handleManualUnlock} className="flex flex-col sm:flex-row items-center gap-3">
                <select
                  required
                  value={unlockQuestionId}
                  onChange={(e) => setUnlockQuestionId(e.target.value)}
                  className="w-full sm:w-80 px-3.5 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white text-xs"
                >
                  <option value="">Select Question to Unlock...</option>
                  {questions.map((q) => (
                    <option key={q._id} value={q._id}>
                      #{q.unlockOrder} - {q.title} ({q.type}, {q.points}pts)
                    </option>
                  ))}
                </select>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    Confirm Unlock
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTeamForUnlock(null)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Teams Table */}
          <div className="glass-panel rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-bold text-white mb-4">Registered Teams & Manual Unlock Action</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800 text-left text-xs">
                <thead className="bg-gray-900/80 text-gray-400 uppercase font-mono">
                  <tr>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Members</th>
                    <th className="px-4 py-3 text-right">Total Score</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-gray-300">
                  {teams.map((t) => (
                    <tr key={t._id} className="hover:bg-gray-800/30">
                      <td className="px-4 py-3 font-semibold text-white">{t.name}</td>
                      <td className="px-4 py-3 font-mono text-cyan-400 font-bold">{t.teamCode}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {t.members?.map((m) => (
                            <span key={m._id} className="px-2 py-0.5 rounded bg-gray-800 text-[10px] text-gray-300">
                              {m.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-amber-400">{t.totalScore} pts</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedTeamForUnlock(t);
                            setUnlockQuestionId(questions[0]?._id || '');
                          }}
                          className="flex items-center space-x-1 ml-auto px-3 py-1 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/80 rounded-lg text-xs cursor-pointer"
                        >
                          <Unlock className="h-3 w-3" />
                          <span>Manual Unlock</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: SUBMISSIONS AUDIT FEED */}
      {activeTab === 'submissions' && (
        <div className="glass-panel rounded-2xl p-6 border border-gray-800">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            <span>Submission Audit Feed (FR-11, SM-2, SU-1)</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800 text-left text-xs">
              <thead className="bg-gray-900/80 text-gray-400 uppercase font-mono">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Participant</th>
                  <th className="px-4 py-3">Question</th>
                  <th className="px-4 py-3">Submitted Answer</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-gray-300">
                {submissions.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-gray-400 font-mono">
                      {new Date(s.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">{s.team?.name || '—'}</td>
                    <td className="px-4 py-3">{s.submittedBy?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-300">{s.question?.title || '—'}</td>
                    <td className="px-4 py-3 font-mono text-gray-200">"{s.answer}"</td>
                    <td className="px-4 py-3">
                      {s.isCorrect ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] border border-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>CORRECT</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-950 text-rose-400 font-mono text-[10px] border border-rose-800">
                          <XCircle className="h-3 w-3" />
                          <span>INCORRECT</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-amber-400">
                      +{s.pointsAwarded}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
