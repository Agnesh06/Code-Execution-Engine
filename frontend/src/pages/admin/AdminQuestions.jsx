import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import AdminNav from './AdminNav';
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle2,
  X,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [selectedRound, setSelectedRound] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Question Form
  const [roundId, setRoundId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('MCQ');
  const [optionsStr, setOptionsStr] = useState('Option A, Option B, Option C, Option D');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [points, setPoints] = useState(20);
  const [unlockOrder, setUnlockOrder] = useState(1);

  const loadData = async (page = 1, roundFilter = selectedRound) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (roundFilter) params.roundId = roundFilter;

      const [qRes, curRoundRes] = await Promise.all([
        api.admin.getQuestions(params),
        api.getCurrentRound()
      ]);

      setQuestions(qRes.questions || []);
      setPagination(qRes.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });

      if (curRoundRes.round) {
        setRounds([curRoundRes.round]);
        if (!roundId) setRoundId(curRoundRes.round._id);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to load questions' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedRound]);

  const openCreateModal = () => {
    setEditingQuestion(null);
    setTitle('');
    setDescription('');
    setType('MCQ');
    setOptionsStr('Option A, Option B, Option C, Option D');
    setCorrectAnswer('');
    setPoints(20);
    setUnlockOrder(questions.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setRoundId(q.round?._id || q.round);
    setTitle(q.title);
    setDescription(q.description);
    setType(q.type);
    setOptionsStr(Array.isArray(q.options) ? q.options.join(', ') : '');
    setCorrectAnswer(q.correctAnswer);
    setPoints(q.points);
    setUnlockOrder(q.unlockOrder);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        roundId,
        title: title.trim(),
        description: description.trim(),
        type,
        correctAnswer: correctAnswer.trim(),
        points: Number(points),
        unlockOrder: Number(unlockOrder)
      };

      if (type === 'MCQ') {
        payload.options = optionsStr.split(',').map(o => o.trim()).filter(Boolean);
      }

      if (editingQuestion) {
        await api.admin.updateQuestion(editingQuestion._id, payload);
        setMessage({ type: 'success', text: `Updated question: ${title}` });
      } else {
        await api.admin.createQuestion(payload);
        setMessage({ type: 'success', text: `Created question: ${title}` });
      }

      setIsModalOpen(false);
      await loadData(pagination.page);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (id, qTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${qTitle}"?`)) return;
    try {
      await api.admin.deleteQuestion(id);
      setMessage({ type: 'success', text: `Deleted question: ${qTitle}` });
      await loadData(pagination.page);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminNav
        title="Question Bank Management"
        subtitle="Create, edit, and organize sequential competition questions (FR-10, QR-1–3)"
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

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Question</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400 font-mono">Total Questions: {pagination.total}</span>
        </div>
      </div>

      {/* Questions Table */}
      <div className="overflow-hidden glass-panel rounded-2xl border border-gray-800 mb-6 shadow-xl">
        <table className="min-w-full divide-y divide-gray-800 text-left">
          <thead className="bg-[#0e1424] text-xs font-semibold uppercase tracking-wider text-gray-400">
            <tr>
              <th className="px-6 py-3.5 w-16">Unlock</th>
              <th className="px-6 py-3.5">Title & Description</th>
              <th className="px-6 py-3.5 w-24">Type</th>
              <th className="px-6 py-3.5 w-24 text-right">Points</th>
              <th className="px-6 py-3.5">Correct Answer</th>
              <th className="px-6 py-3.5 text-right w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 font-medium text-sm">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
                </td>
              </tr>
            ) : questions.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No questions found. Click "Add New Question" above to create one.
                </td>
              </tr>
            ) : (
              questions.map((q) => (
                <tr key={q._id} className="hover:bg-gray-800/40 text-gray-200 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="h-7 w-7 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 font-mono font-bold flex items-center justify-center text-xs">
                      #{q.unlockOrder}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{q.title}</div>
                    <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">{q.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      q.type === 'MCQ'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {q.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-amber-400">
                    +{q.points}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-emerald-400 bg-emerald-950/20 rounded px-2 py-1 inline-block mt-3">
                    {q.correctAnswer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <button
                      onClick={() => openEditModal(q)}
                      title="Edit Question"
                      className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer inline-block"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(q._id, q.title)}
                      title="Delete Question"
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-500/30 transition-colors cursor-pointer inline-block"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
              onClick={() => loadData(pagination.page - 1)}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadData(pagination.page + 1)}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#10172a] border border-gray-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-4">
              {editingQuestion ? 'Edit Competition Question' : 'Create New Competition Question'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Description / Problem Statement
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="RIDDLE">RIDDLE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Unlock Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={unlockOrder}
                    onChange={(e) => setUnlockOrder(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              {type === 'MCQ' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={optionsStr}
                    onChange={(e) => setOptionsStr(e.target.value)}
                    placeholder="Alpha, Beta, Gamma, Delta"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                    required
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Separate available MCQ choices with commas.</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Correct Answer {type === 'MCQ' ? '(Exact match to one option)' : '(Case-insensitive riddle text)'}
                </label>
                <input
                  type="text"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold shadow-lg shadow-cyan-600/20 cursor-pointer"
                >
                  {editingQuestion ? 'Save Changes' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
