import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import AdminNav from './AdminNav';
import {
  Layers,
  Play,
  Square,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Radio
} from 'lucide-react';

export default function AdminRounds() {
  const [event, setEvent] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Form states
  const [newRoundName, setNewRoundName] = useState('');
  const [newRoundOrder, setNewRoundOrder] = useState(2);
  const [newEventName, setNewEventName] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [evRes, rdRes] = await Promise.all([
        api.getCurrentEvent(),
        api.getCurrentRound()
      ]);
      setEvent(evRes.event);

      // If we have an event, load questions/rounds context
      if (evRes.event) {
        // Fetch rounds by checking current or getting questions to infer rounds, or querying rounds
        const curRound = rdRes.round;
        if (curRound) {
          setRounds([curRound]);
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to load tournament data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartEvent = async () => {
    if (!event) return;
    try {
      const res = await api.admin.startEvent(event._id || event.id);
      setEvent(res.event);
      setMessage({ type: 'success', text: `Event started: ${res.event.name}` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleEndEvent = async () => {
    if (!event) return;
    try {
      const res = await api.admin.endEvent(event._id || event.id);
      setEvent(res.event);
      setMessage({ type: 'success', text: `Event ended: ${res.event.name}` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleCreateRound = async (e) => {
    e.preventDefault();
    if (!event) {
      setMessage({ type: 'error', text: 'An active event is required to create a round' });
      return;
    }
    try {
      const res = await api.admin.createRound(event._id || event.id, newRoundName, newRoundOrder);
      setRounds(prev => [...prev, res.round]);
      setNewRoundName('');
      setNewRoundOrder(prev => prev + 1);
      setMessage({ type: 'success', text: `Round created: ${res.round.name}` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleOpenRound = async (roundId) => {
    try {
      const res = await api.admin.openRound(roundId);
      setRounds(prev => prev.map(r => r._id === roundId ? res.round : r));
      setMessage({ type: 'success', text: `Round opened: ${res.round.name}` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleCloseRound = async (roundId) => {
    try {
      const res = await api.admin.closeRound(roundId);
      setRounds(prev => prev.map(r => r._id === roundId ? res.round : r));
      setMessage({ type: 'success', text: `Round closed: ${res.round.name}` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.admin.createEvent(newEventName);
      setEvent(res.event);
      setNewEventName('');
      setMessage({ type: 'success', text: `Event created: ${res.event.name}` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminNav
        title="Rounds & Event Control"
        subtitle="Manage competition lifecycle, open and close rounds (FR-13, RC-1, RC-2)"
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Event Status Card */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Radio className="h-5 w-5 text-cyan-400" />
              <span>Tournament Event Status</span>
            </h2>

            {event ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                <div>
                  <h3 className="text-white font-semibold text-lg">{event.name}</h3>
                  <div className="flex items-center space-x-3 mt-1 text-xs font-mono">
                    <span className="text-gray-400">ID: {event._id || event.id}</span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                      event.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : event.status === 'ENDED'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {event.status !== 'ACTIVE' && (
                    <button
                      onClick={handleStartEvent}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Start Event</span>
                    </button>
                  )}
                  {event.status === 'ACTIVE' && (
                    <button
                      onClick={handleEndEvent}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      <Square className="h-3.5 w-3.5" />
                      <span>End Event</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateEvent} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter Tournament Event Name"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-lg"
                >
                  Create Event
                </button>
              </form>
            )}
          </div>

          {/* Rounds Management Card */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Layers className="h-5 w-5 text-violet-400" />
              <span>Competition Rounds</span>
            </h2>

            {/* Existing Rounds Table */}
            <div className="overflow-hidden rounded-xl border border-gray-800 mb-6">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-[#0e1424] text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="px-6 py-3 text-left">Order</th>
                    <th className="px-6 py-3 text-left">Round Name</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-medium">
                  {rounds.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500 text-sm">
                        No rounds found. Create your first round below.
                      </td>
                    </tr>
                  ) : (
                    rounds.map((rd) => (
                      <tr key={rd._id} className="hover:bg-gray-800/40 text-gray-200">
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-cyan-400">
                          #{rd.order}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-white">
                          {rd.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase font-mono ${
                            rd.status === 'OPEN'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : rd.status === 'CLOSED'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-gray-800 text-gray-400 border border-gray-700'
                          }`}>
                            {rd.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          {rd.status !== 'OPEN' && (
                            <button
                              onClick={() => handleOpenRound(rd._id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold cursor-pointer transition-colors"
                            >
                              Open Round
                            </button>
                          )}
                          {rd.status === 'OPEN' && (
                            <button
                              onClick={() => handleCloseRound(rd._id)}
                              className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold cursor-pointer transition-colors"
                            >
                              Close Round
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Create Round Form */}
            <form onSubmit={handleCreateRound} className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-4">
              <h3 className="text-sm font-semibold text-gray-300">Add New Competition Round</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Round Name (e.g. Round 2: Algorithmic Riddles)"
                  value={newRoundName}
                  onChange={(e) => setNewRoundName(e.target.value)}
                  className="sm:col-span-2 bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Order"
                  min="1"
                  value={newRoundOrder}
                  onChange={(e) => setNewRoundOrder(Number(e.target.value))}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-md"
              >
                <Plus className="h-4 w-4" />
                <span>Create Round</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
