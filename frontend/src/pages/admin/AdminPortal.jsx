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

  const [event, setEvent] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

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

  useEffect(() => { loadAll(); }, []);

  const showNotification = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleStartEvent = async () => {
    if (!event) return;
    try {
      const res = await api.admin.startEvent(event._id);
      setEvent(res.event);
      showNotification('Event status set to ACTIVE');
    } catch (err) { showNotification(err.message, 'error'); }
  };

  const handleEndEvent = async () => {
    if (!event) return;
    try {
      const res = await api.admin.endEvent(event._id);
      setEvent(res.event);
      showNotification('Event ended successfully');
    } catch (err) { showNotification(err.message, 'error'); }
  };

  const handleOpenRound = async (roundId) => {
    try {
      await api.admin.openRound(roundId);
      showNotification('Round OPENED — Question #1 exposed to participants');
      await loadAll();
    } catch (err) { showNotification(err.message, 'error'); }
  };

  const handleCloseRound = async (roundId) => {
    try {
      await api.admin.closeRound(roundId);
      showNotification('Round CLOSED');
      await loadAll();
    } catch (err) { showNotification(err.message, 'error'); }
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
    } catch (err) { showNotification(err.message, 'error'); }
  };

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
      setNewQTitle(''); setNewQDesc(''); setNewQAnswer('');
      setNewQOrder((prev) => prev + 1);
      showNotification('Question created successfully');
      await loadAll();
    } catch (err) { showNotification(err.message, 'error'); }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.admin.deleteQuestion(id);
      showNotification('Question deleted');
      await loadAll();
    } catch (err) { showNotification(err.message, 'error'); }
  };

  const handleManualUnlock = async (e) => {
    e.preventDefault();
    if (!selectedTeamForUnlock || !unlockQuestionId) return;
    try {
      await api.admin.manualUnlockQuestion(selectedTeamForUnlock._id, unlockQuestionId);
      showNotification(`Manually unlocked question for ${selectedTeamForUnlock.name}!`);
      setSelectedTeamForUnlock(null);
      setUnlockQuestionId('');
      await loadAll();
    } catch (err) { showNotification(err.message, 'error'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-blueLight border-t-brand-blue" />
      </div>
    );
  }

  const tabs = [
    { id: 'rounds',      label: 'Event & Rounds',                    icon: Layers },
    { id: 'questions',   label: `Questions (${questions.length})`,   icon: HelpCircle },
    { id: 'teams',       label: `Teams (${teams.length})`,           icon: Users },
    { id: 'submissions', label: `Submissions (${submissions.length})`, icon: FileText },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-10 w-10 rounded-xl bg-brand-blueSoft flex items-center justify-center">
              <Shield className="h-5 w-5 text-brand-blue" />
            </div>
            <h1 className="text-2xl font-bold text-brand-navy">Admin Command Center</h1>
          </div>
          <p className="text-sm text-brand-muted pl-12">
            Tournament rounds control, questions management, team status, and manual unlock overrides.
          </p>
        </div>

        {/* Notification Toast */}
        {message && (
          <div className={`animate-slide-up flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {message.type === 'success'
              ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              : <AlertCircle className="h-4 w-4 flex-shrink-0" />
            }
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-brand-border gap-1 mb-8 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === id
                ? 'border-brand-blue text-brand-blue bg-brand-blueSoft/40'
                : 'border-transparent text-brand-muted hover:text-brand-navy hover:bg-slate-50'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: EVENT & ROUNDS ── */}
      {activeTab === 'rounds' && (
        <div className="space-y-6">

          {/* Event Lifecycle */}
          <div className="card p-6">
            <h2 className="text-base font-bold text-brand-navy mb-4">Event Lifecycle</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-brand-navy">{event?.name || 'No Event Created'}</p>
                <p className="text-xs text-brand-muted mt-0.5">
                  Status:{' '}
                  <span className={`font-semibold ${
                    event?.status === 'ACTIVE' ? 'text-green-600'
                    : event?.status === 'ENDED' ? 'text-red-500'
                    : 'text-brand-muted'
                  }`}>{event?.status}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleStartEvent}
                  disabled={event?.status === 'ACTIVE'}
                  className="btn-success !rounded-lg !text-xs !px-4 !py-2"
                >
                  <Play className="h-3.5 w-3.5" />
                  Start Event
                </button>
                <button
                  onClick={handleEndEvent}
                  disabled={event?.status === 'ENDED'}
                  className="btn-danger !rounded-lg !text-xs !px-4 !py-2"
                >
                  <Square className="h-3.5 w-3.5" />
                  End Event
                </button>
              </div>
            </div>
          </div>

          {/* Rounds Control */}
          <div className="card p-6">
            <h2 className="text-base font-bold text-brand-navy mb-4">Rounds Control</h2>
            <div className="space-y-3">
              {rounds.map((r) => (
                <div key={r._id} className="p-4 rounded-xl bg-slate-50 border border-brand-border flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-brand-muted">Round #{r.order}</span>
                    <h3 className="text-sm font-bold text-brand-navy">{r.name}</h3>
                    <span className={`badge mt-1 ${r.status === 'OPEN' ? 'badge-green' : 'badge-gray'}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenRound(r._id)}
                      disabled={r.status === 'OPEN'}
                      className="btn-primary !rounded-lg !text-xs !px-3.5 !py-1.5"
                    >
                      Open Round
                    </button>
                    <button
                      onClick={() => handleCloseRound(r._id)}
                      disabled={r.status === 'CLOSED'}
                      className="btn-ghost !border !border-brand-border !rounded-lg !text-xs !px-3.5 !py-1.5"
                    >
                      Close Round
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Create Round Form */}
            <form onSubmit={handleCreateRound} className="mt-5 pt-5 border-t border-brand-border grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Round name (e.g. Round 2: Riddles)"
                value={newRoundName}
                onChange={(e) => setNewRoundName(e.target.value)}
                className="input-field text-xs"
              />
              <input
                type="number"
                required
                min={1}
                placeholder="Order"
                value={newRoundOrder}
                onChange={(e) => setNewRoundOrder(e.target.value)}
                className="input-field text-xs"
              />
              <button type="submit" className="btn-primary !rounded-xl text-xs">
                <Plus className="h-3.5 w-3.5" /> Create Round
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB 2: QUESTIONS CRUD ── */}
      {activeTab === 'questions' && (
        <div className="space-y-6">

          {/* Create Question Form */}
          <div className="card p-6">
            <h2 className="text-base font-bold text-brand-navy mb-5 flex items-center gap-2">
              <Plus className="h-5 w-5 text-brand-blue" />
              Create New Question
            </h2>

            <form onSubmit={handleCreateQuestion} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-brand-muted mb-1.5 uppercase tracking-wider">Question Title</label>
                <input
                  type="text" required
                  placeholder="e.g. Cyber Trivia #1"
                  value={newQTitle}
                  onChange={(e) => setNewQTitle(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-brand-muted mb-1.5 uppercase tracking-wider">Description / Question Text</label>
                <textarea
                  rows={3} required
                  placeholder="Enter the full question or riddle text..."
                  value={newQDesc}
                  onChange={(e) => setNewQDesc(e.target.value)}
                  className="input-field text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1.5 uppercase tracking-wider">Question Type</label>
                <select
                  value={newQType}
                  onChange={(e) => setNewQType(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="MCQ">MCQ (Multiple Choice)</option>
                  <option value="RIDDLE">RIDDLE (Open Text Answer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1.5 uppercase tracking-wider">Points Awarded</label>
                <input
                  type="number" min={1} required
                  value={newQPoints}
                  onChange={(e) => setNewQPoints(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1.5 uppercase tracking-wider">Unlock Order</label>
                <input
                  type="number" min={1} required
                  value={newQOrder}
                  onChange={(e) => setNewQOrder(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1.5 uppercase tracking-wider">Target Round</label>
                <select
                  value={newQRoundId}
                  onChange={(e) => setNewQRoundId(e.target.value)}
                  className="input-field text-sm"
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
                  <label className="block text-xs font-semibold text-brand-muted mb-1.5 uppercase tracking-wider">MCQ Options (comma-separated)</label>
                  <input
                    type="text" required
                    placeholder="Option 1, Option 2, Option 3, Option 4"
                    value={newQOptions}
                    onChange={(e) => setNewQOptions(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-brand-muted mb-1.5 uppercase tracking-wider">Correct Answer</label>
                <input
                  type="text" required
                  placeholder="Expected correct answer"
                  value={newQAnswer}
                  onChange={(e) => setNewQAnswer(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" className="btn-primary">
                  <Plus className="h-4 w-4" /> Add Question
                </button>
              </div>
            </form>
          </div>

          {/* Questions Table */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-brand-border">
              <h2 className="text-base font-bold text-brand-navy">Active Question Catalog</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-border text-left text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-brand-muted">Order</th>
                    <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-brand-muted">Title</th>
                    <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-brand-muted">Type</th>
                    <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-brand-muted">Points</th>
                    <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-brand-muted">Correct Answer</th>
                    <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-brand-muted text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border bg-white">
                  {questions.map((q) => (
                    <tr key={q._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-brand-blue">#{q.unlockOrder}</td>
                      <td className="px-5 py-3.5 font-semibold text-brand-navy">{q.title}</td>
                      <td className="px-5 py-3.5">
                        <span className={`badge ${q.type === 'MCQ' ? 'badge-blue' : 'badge-violet'}`}>{q.type}</span>
                      </td>
                      <td className="px-5 py-3.5 font-mono font-semibold text-brand-amber">{q.points}</td>
                      <td className="px-5 py-3.5 font-mono text-green-600">{q.correctAnswer}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteQuestion(q._id)}
                          className="p-1.5 rounded-lg text-brand-muted hover:text-red-500 hover:bg-red-50 transition-colors"
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

      {/* ── TAB 3: TEAMS & MANUAL UNLOCK ── */}
      {activeTab === 'teams' && (
        <div className="space-y-6">

          {/* Manual Unlock Panel */}
          {selectedTeamForUnlock && (
            <div className="glass-panel-glow p-6 animate-slide-up">
              <h3 className="text-base font-bold text-brand-navy mb-1 flex items-center gap-2">
                <Unlock className="h-4 w-4 text-brand-blue" />
                Manual Question Unlock Override
              </h3>
              <p className="text-sm text-brand-muted mb-4">
                Unlocking a question for team{' '}
                <strong className="text-brand-navy">{selectedTeamForUnlock.name}</strong>{' '}
                will make it visible to them without marking it as solved or awarding points.
              </p>
              <form onSubmit={handleManualUnlock} className="flex flex-col sm:flex-row items-center gap-3">
                <select
                  required
                  value={unlockQuestionId}
                  onChange={(e) => setUnlockQuestionId(e.target.value)}
                  className="input-field w-full sm:w-80 text-sm"
                >
                  <option value="">Select Question to Unlock...</option>
                  {questions.map((q) => (
                    <option key={q._id} value={q._id}>
                      #{q.unlockOrder} — {q.title} ({q.type}, {q.points}pts)
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button type="submit" className="btn-primary !rounded-lg !text-sm !px-4 !py-2">
                    Confirm Unlock
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTeamForUnlock(null)}
                    className="btn-ghost !border !border-brand-border !rounded-lg !text-sm !px-4 !py-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Teams Table */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-brand-border">
              <h2 className="text-base font-bold text-brand-navy">Registered Teams & Manual Unlock</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-border text-left text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-brand-muted">Team</th>
                    <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-brand-muted">Code</th>
                    <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-brand-muted">Members</th>
                    <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-brand-muted text-right">Score</th>
                    <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-brand-muted text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border bg-white">
                  {teams.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-brand-navy">{t.name}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-brand-blue tracking-wider">{t.teamCode}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {t.members?.map((m) => (
                            <span key={m._id} className="badge badge-gray">
                              {m.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-brand-blue">{t.totalScore} pts</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedTeamForUnlock(t);
                            setUnlockQuestionId(questions[0]?._id || '');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-blueSoft hover:bg-brand-blueLight border border-brand-blueLight text-brand-blue rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          <Unlock className="h-3 w-3" />
                          Manual Unlock
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

      {/* ── TAB 4: SUBMISSIONS AUDIT ── */}
      {activeTab === 'submissions' && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-brand-border flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-blue" />
            <h2 className="text-base font-bold text-brand-navy">Submission Audit Feed</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-brand-border text-left text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-brand-muted">Timestamp</th>
                  <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-brand-muted">Team</th>
                  <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-brand-muted">Participant</th>
                  <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-brand-muted">Question</th>
                  <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-brand-muted">Answer</th>
                  <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-brand-muted">Result</th>
                  <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-brand-muted text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border bg-white">
                {submissions.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 text-brand-muted font-mono">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(s.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-brand-navy">{s.team?.name || '—'}</td>
                    <td className="px-5 py-3.5 text-brand-navyMid">{s.submittedBy?.name || '—'}</td>
                    <td className="px-5 py-3.5 text-brand-navyMid">{s.question?.title || '—'}</td>
                    <td className="px-5 py-3.5 font-mono text-brand-navyMid">"{s.answer}"</td>
                    <td className="px-5 py-3.5">
                      {s.isCorrect ? (
                        <span className="badge badge-green">
                          <CheckCircle2 className="h-3 w-3" /> CORRECT
                        </span>
                      ) : (
                        <span className="badge badge-red">
                          <XCircle className="h-3 w-3" /> WRONG
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-brand-blue">
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
