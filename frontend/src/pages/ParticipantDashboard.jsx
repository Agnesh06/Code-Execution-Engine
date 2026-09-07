import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import QuestionCard from '../components/QuestionCard';
import { Trophy, Users, History, CheckCircle2, XCircle, Zap } from 'lucide-react';

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
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-blueLight border-t-brand-blue" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

      {/* Tournament Banner */}
      <div className="card p-5 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">
              {event?.status || 'Active Event'}
            </span>
          </div>
          <h1 className="text-xl font-bold text-brand-navy">
            {event?.name || 'Grand Tournament'}
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Current Stage:{' '}
            <span className="font-semibold text-brand-blue">{round?.name || 'Open Round'}</span>
          </p>
        </div>

        {/* Team Score Card */}
        <div className="flex items-center gap-5 bg-slate-50 border border-brand-border rounded-xl px-5 py-3">
          <div>
            <div className="text-[10px] uppercase font-semibold text-brand-muted tracking-wider mb-0.5">Team Score</div>
            <div className="text-2xl font-mono font-extrabold text-brand-blue">
              {team?.totalScore ?? 0}
              <span className="text-sm font-normal text-brand-muted ml-1">pts</span>
            </div>
          </div>
          <div className="w-px h-10 bg-brand-border" />
          <div>
            <div className="text-[10px] uppercase font-semibold text-brand-muted tracking-wider mb-0.5">Team</div>
            <div className="text-sm font-bold text-brand-navy truncate max-w-[140px]">{team?.name}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-brand-blueSoft flex items-center justify-center">
            <Zap className="h-5 w-5 text-brand-blue" />
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="alert-error mb-6 animate-fade-in">
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Question */}
        <div className="lg:col-span-2">
          <QuestionCard
            question={currentQuestion}
            roundComplete={roundComplete}
            onSubmitAnswer={handleSubmitAnswer}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Right 1 Col: Sidebar */}
        <div className="space-y-5">

          {/* Team Roster */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-muted mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-blue" />
              Teammates
            </h3>
            <div className="space-y-2">
              {team?.members?.map((m) => (
                <div key={m._id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-brand-border">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-brand-blue flex items-center justify-center text-white text-xs font-bold">
                      {m.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-brand-navy">{m.name}</span>
                  </div>
                  {m._id === user._id && (
                    <span className="badge badge-blue">You</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submission History */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-muted mb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-brand-blue" />
              Recent Submissions
            </h3>

            {submissions.length === 0 ? (
              <p className="text-xs text-brand-muted italic text-center py-4">No submissions yet.</p>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {submissions.slice(0, 10).map((sub) => (
                  <div
                    key={sub._id}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 transition-colors ${
                      sub.isCorrect
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden min-w-0">
                      {sub.isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="font-semibold">{sub.question?.title || 'Question'}</span>: "{sub.answer}"
                      </div>
                    </div>
                    <span className="font-mono font-bold flex-shrink-0">
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
