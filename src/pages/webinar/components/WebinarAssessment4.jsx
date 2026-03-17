import { useState, useCallback } from 'react';
import { WEBINAR_ASSESSMENT_4_QUESTIONS } from '../data/webinarAssessment4Questions';

export default function WebinarAssessment4({ onComplete, nextLabel, onGoNext }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(() => {
    const initial = {};
    WEBINAR_ASSESSMENT_4_QUESTIONS.forEach((q) => {
      initial[q.id] = '';
    });
    return initial;
  });
  const [report, setReport] = useState(null);

  const setAnswer = useCallback((questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const questions = WEBINAR_ASSESSMENT_4_QUESTIONS;
  const currentQuestion = questions[questionIndex];
  const allAnswered = questions.every((q) => (answers[q.id] || '').trim() !== '');
  const isLast = questionIndex === questions.length - 1;

  const handleSubmit = useCallback(() => {
    if (!allAnswered) return;
    let score = 0;
    const results = questions.map((q) => {
      const userAnswer = (answers[q.id] || '').trim();
      const correct = userAnswer === q.correctAnswer;
      if (correct) score += 1;
      return {
        questionId: q.id,
        text: q.text,
        correct,
        userAnswer: userAnswer || '—',
        correctAnswer: q.correctAnswer,
      };
    });
    setReport({ score, total: questions.length, results });
  }, [allAnswered, answers, questions]);

  const handleContinue = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  const handleGoNext = useCallback(() => {
    onComplete?.();
    onGoNext?.();
  }, [onComplete, onGoNext]);

  if (report) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="flex flex-col items-center px-6 py-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-navy/10 text-primary-navy mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-primary-navy">Assessment 4 completed</h2>
          <p className="mt-2 text-base font-medium text-gray-800">
            You scored {report.score} out of {report.total}.
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-1">
          <div className="rounded-xl bg-white border border-gray-200 border-l-2 border-l-primary-navy p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Report</h3>
            {report.results.map((r, idx) => (
              <div
                key={r.questionId}
                className={`rounded-lg border-2 p-4 ${
                  r.correct ? 'border-green-200 bg-green-50/80' : 'border-red-200 bg-red-50/80'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      r.correct ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}
                  >
                    {r.correct ? '✓' : '✕'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {idx + 1}. {r.text}
                    </p>
                    {r.correct ? (
                      <p className="mt-1 text-xs text-green-800">Your answer: {r.userAnswer}</p>
                    ) : (
                      <div className="mt-2 space-y-1 text-xs">
                        <p className="text-red-800">Your answer: {r.userAnswer}</p>
                        <p className="text-green-800">Correct answer: {r.correctAnswer}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 pt-5 mt-auto">
          {nextLabel && onGoNext ? (
            <button
              type="button"
              onClick={handleGoNext}
              className="w-full py-2.5 px-4 bg-primary-navy hover:bg-primary-navy/90 text-white font-medium rounded-lg transition inline-flex items-center justify-center gap-2"
            >
              Next: {nextLabel}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleContinue}
              className="w-full py-2.5 px-4 bg-primary-navy hover:bg-primary-navy/90 text-white font-medium rounded-lg transition"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 px-1 pb-4">
        <h2 className="text-lg font-semibold text-gray-800">Assessment 4</h2>
        <p className="text-sm text-gray-500 mt-0.5">5 mins · {questions.length} questions</p>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>Question {questionIndex + 1} of {questions.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
          <div
            className="bg-primary-navy h-1.5 rounded-full transition-all"
            style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="rounded-xl bg-white border border-gray-200 border-l-2 border-l-primary-navy p-5 sm:p-6">
          <p className="text-base font-semibold text-gray-900 mb-5">{currentQuestion.text}</p>
          {currentQuestion.type === 'mcq' && (
            <div className="space-y-3">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = (answers[currentQuestion.id] || '') === opt;
                return (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 w-full rounded-lg border-2 py-3 px-4 transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-primary-navy bg-primary-navy/10'
                        : 'border-gray-200 bg-gray-50/80 hover:border-primary-navy/30 hover:bg-primary-navy/5'
                    }`}
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={opt}
                      checked={isSelected}
                      onChange={() => setAnswer(currentQuestion.id, opt)}
                      className="sr-only"
                    />
                    <span
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isSelected ? 'bg-primary-navy text-white' : 'bg-primary-navy/10 text-primary-navy'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm font-medium text-gray-800">{opt}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 flex gap-3 pt-5 mt-auto">
        <button
          type="button"
          onClick={() => setQuestionIndex((i) => Math.max(0, i - 1))}
          disabled={questionIndex === 0}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        {!isLast ? (
          <button
            type="button"
            onClick={() => setQuestionIndex((i) => i + 1)}
            className="flex-1 py-2.5 px-4 bg-primary-navy hover:bg-primary-navy/90 text-white font-medium rounded-lg transition"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="flex-1 py-2.5 px-4 bg-primary-navy hover:bg-primary-navy/90 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Assessment 4
          </button>
        )}
      </div>
    </div>
  );
}
