import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import QuestionCard from '../components/QuestionCard';
import { Trophy, Users, ShieldAlert, History, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

export default function ParticipantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [event, setEvent] = useState(null);
  const [round, setRound] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [roundComplete, setRoundComplete] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Initial load
  useEffect(() => {
    if (!user?.team) {
      navigate('/team-setup');
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const [teamRes, eventRes, roundRes, subRes] = await Promise.all([
          api.getMyTeam(),
          api.getCurrentEvent(),
          api.getCurrentRound(),
          api.getMySubmissions()
        ]);

        setTeam(teamRes.team);
        setEvent(eventRes.event);
        setRound(roundRes.round);
        setSubmissions(subRes.submissions || []);

        // Load current unlocked question
        await fetchCurrentQuestion();
      } catch (err) {
        setError(err.message || 'Failed to load tournament arena data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, navigate]);

  const fetchCurrentQuestion = async () => {
    try {
      const res = await api.getCurrentQuestion();
      if (res.roundComplete) {
        setRoundComplete(true);
        setCurrentQuestion(null);
      } else {
        setRoundComplete(false);
        setCurrentQuestion(res.question);
      }
    } catch (err) {
      console.warn('Could not fetch current question:', err.message);
    }
  };

  const handleSubmitAnswer = async (questionId, answer) => {
    setIsSubmitting(true);
    try {
      const result = await api.submitAnswer(questionId, answer);

      // Refresh team score, submissions, and advance question upon correct answer (D-8)
      const [teamRes, subRes] = await Promise.all([
        api.getMyTeam(),
        api.getMySubmissions()
      ]);
      setTeam(teamRes.team);
      setSubmissions(subRes.submissions || []);

      if (result.isCorrect) {
        await fetchCurrentQuestion();
      }

      return result;
    } finally {
      setIsSubmitting(false);
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
      
      {/* Top Tournament Event Status Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-gray-800 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs uppercase font-mono tracking-widest text-emerald-400">
              {event?.status || 'Active Event'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white font-['Outfit'] mt-1">
            {event?.name || 'Grand Tournament'}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Current Stage: <span className="text-cyan-400 font-semibold">{round?.name || 'Open Round'}</span>
          </p>
        </div>

        {/* Team Score Card */}
        <div className="flex items-center space-x-4 bg-gray-900/80 border border-gray-700/80 rounded-xl px-5 py-3 shadow-inner">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Team Score</span>
            <div className="text-2xl font-mono font-extrabold text-amber-400">
              {team?.totalScore ?? 0} <span className="text-xs font-normal text-gray-500">pts</span>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-700" />
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Team Name</span>
            <div className="text-sm font-bold text-white truncate max-w-[140px]">{team?.name}</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Main Arena Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Question Solver */}
        <div className="lg:col-span-2 space-y-6">
          <QuestionCard
            question={currentQuestion}
            roundComplete={roundComplete}
            onSubmitAnswer={handleSubmitAnswer}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Right 1 Col: Team Roster & Submission Audit Feed */}
        <div className="space-y-6">
          
          {/* Team Roster Card */}
          <div className="glass-panel rounded-2xl p-5 border border-gray-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center space-x-2">
              <Users className="h-4 w-4 text-violet-400" />
              <span>Teammates</span>
            </h3>
            <div className="space-y-2">
              {team?.members?.map((m) => (
                <div key={m._id} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-gray-900/60 border border-gray-800">
                  <span className="font-medium text-gray-200">{m.name}</span>
                  {m._id === user._id && (
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono">You</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submission History Feed */}
          <div className="glass-panel rounded-2xl p-5 border border-gray-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center space-x-2">
              <History className="h-4 w-4 text-cyan-400" />
              <span>Recent Submissions</span>
            </h3>

            {submissions.length === 0 ? (
              <p className="text-xs text-gray-500 italic text-center py-4">No submissions yet.</p>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {submissions.slice(0, 10).map((sub) => (
                  <div
                    key={sub._id}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                      sub.isCorrect
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                        : 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 overflow-hidden">
                      {sub.isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="font-semibold">{sub.question?.title || 'Question'}</span>: "{sub.answer}"
                      </div>
                    </div>
                    <span className="font-mono font-bold ml-2">
                      {sub.isCorrect ? `+${sub.pointsAwarded}` : '0'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
