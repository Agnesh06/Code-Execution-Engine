import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Send, Award, Sparkles } from 'lucide-react';

export default function QuestionCard({ question, roundComplete, onSubmitAnswer, isSubmitting }) {
  const [selectedOption, setSelectedOption] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  if (roundComplete) {
    return (
      <div className="card p-10 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-5">
          <Sparkles className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-brand-navy mb-2">Round Completed!</h2>
        <p className="text-brand-muted max-w-md mx-auto text-sm leading-relaxed">
          Outstanding work! Your team has solved all available questions in this round.
          Stay tuned for upcoming rounds or monitor your team position on the live leaderboard!
        </p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="card p-10 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-slate-100 text-brand-muted mb-4 mx-auto">
          <HelpCircle className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-brand-navy">No Questions Available</h3>
        <p className="text-sm text-brand-muted mt-1">
          Please wait for the tournament administrator to open the round.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    const answer = question.type === 'MCQ' ? selectedOption : textAnswer;
    if (!answer || !answer.trim()) {
      setFeedback({ type: 'error', message: 'Please select or enter an answer before submitting.' });
      return;
    }

    try {
      const result = await onSubmitAnswer(question._id, answer.trim());
      if (result.isCorrect) {
        setFeedback({
          type: 'success',
          message: `Correct! +${result.pointsAwarded} points awarded to your team!`
        });
        setSelectedOption('');
        setTextAnswer('');
      } else {
        setFeedback({
          type: 'error',
          message: 'Incorrect answer! You may retry without penalty.'
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Submission failed. Please retry.'
      });
    }
  };

  return (
    <div className="card p-6 sm:p-8 animate-scale-in hover:shadow-md transition-all duration-300 hover:-translate-y-1">

      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-5 border-b border-brand-border">
        <div className="flex items-center gap-2">
          <span className="badge badge-gray font-mono">
            Question #{question.unlockOrder}
          </span>
          <span className={`badge ${question.type === 'MCQ' ? 'badge-blue' : 'badge-violet'}`}>
            {question.type}
          </span>
        </div>
        <div className="flex items-center gap-1.5 badge badge-green !px-3 !py-1">
          <Award className="h-3.5 w-3.5" />
          <span>{question.points} Points</span>
        </div>
      </div>

      {/* Question Title & Description */}
      <div className="mb-7">
        <h2 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-brand-navy to-brand-blue mb-4">
          {question.title}
        </h2>
        <div className="bg-slate-50 border border-brand-border rounded-xl p-5 shadow-inner">
          <p className="text-brand-navyMid text-base leading-relaxed whitespace-pre-line">
            {question.description}
          </p>
        </div>
      </div>

      {/* Answer Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {question.type === 'MCQ' ? (
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Select Your Answer
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {question.options?.map((option, idx) => {
                const isSelected = selectedOption === option;
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelectedOption(option)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                      isSelected
                        ? 'border-brand-blue bg-brand-blueSoft text-brand-blue shadow-md scale-[1.02]'
                        : 'border-brand-border bg-white text-brand-navyMid hover:border-brand-blueMid hover:bg-brand-blueSoft/40 hover:shadow-sm'
                    }`}
                  >
                    <span className="font-semibold text-base">{option}</span>
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? 'border-brand-blue bg-brand-blue' : 'border-brand-borderDark'
                    }`}>
                      {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Your Riddle Answer
            </label>
            <input
              type="text"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="input-field"
            />
          </div>
        )}

        {/* Feedback Alert */}
        {feedback && (
          <div className={`animate-fade-in ${feedback.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-1">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit Answer</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
