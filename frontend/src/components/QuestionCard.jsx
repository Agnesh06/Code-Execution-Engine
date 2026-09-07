import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Send, Award, Sparkles } from 'lucide-react';

export default function QuestionCard({ question, roundComplete, onSubmitAnswer, isSubmitting }) {
  const [selectedOption, setSelectedOption] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  if (roundComplete) {
    return (
      <div className="glass-panel-glow rounded-2xl p-10 text-center border border-cyan-500/30">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-4 animate-bounce">
          <Sparkles className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 font-['Outfit']">Round Completed!</h2>
        <p className="text-gray-300 max-w-md mx-auto mb-4 text-sm">
          Outstanding work! Your team has solved all available questions in this round. Stay tuned for upcoming rounds or monitor your team position on the live leaderboard!
        </p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="glass-panel rounded-2xl p-10 text-center border border-gray-800">
        <HelpCircle className="h-10 w-10 text-gray-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-300">No Questions Available</h3>
        <p className="text-xs text-gray-500 mt-1">Please wait for the tournament administrator to open the round.</p>
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
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-gray-800 shadow-2xl relative overflow-hidden">
      {/* Top Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800">
            Question #{question.unlockOrder}
          </span>
          <span className={`text-xs font-mono font-semibold uppercase px-2.5 py-1 rounded-md ${
            question.type === 'MCQ'
              ? 'bg-violet-950 text-violet-300 border border-violet-800'
              : 'bg-amber-950 text-amber-300 border border-amber-800'
          }`}>
            {question.type}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 text-xs font-mono font-bold">
          <Award className="h-3.5 w-3.5" />
          <span>{question.points} Points</span>
        </div>
      </div>

      {/* Question Title & Description */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 font-['Outfit']">
          {question.title}
        </h2>
        <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line bg-[#090d16]/70 p-4 rounded-xl border border-gray-800/80">
          {question.description}
        </p>
      </div>

      {/* Answer Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {question.type === 'MCQ' ? (
          <div className="space-y-3">
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-400">
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
                    className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10'
                        : 'bg-gray-800/40 border-gray-700/60 text-gray-300 hover:bg-gray-800/80 hover:border-gray-600'
                    }`}
                  >
                    <span className="font-medium text-sm">{option}</span>
                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-gray-600'
                    }`}>
                      {isSelected && <div className="h-2 w-2 rounded-full bg-gray-950" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-400">
              Your Riddle Answer
            </label>
            <input
              type="text"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>
        )}

        {/* Feedback alert */}
        {feedback && (
          <div className={`p-4 rounded-xl flex items-center space-x-3 text-sm border animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
            ) : (
              <XCircle className="h-5 w-5 flex-shrink-0 text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Submit action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
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
