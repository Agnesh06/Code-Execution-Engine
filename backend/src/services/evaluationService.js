/**
 * Answer Evaluation Service
 * Fulfills EV-1, EV-2, D-9
 */
function evaluate(question, answerText) {
  if (!question || !question.correctAnswer || typeof answerText !== 'string') {
    return false;
  }

  const normalize = (s) => (s || '').toString().trim().toLowerCase();

  return normalize(answerText) === normalize(question.correctAnswer);
}

module.exports = { evaluate };
