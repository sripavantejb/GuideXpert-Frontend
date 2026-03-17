import { useState, useCallback } from 'react';
import { WEBINAR_ASSESSMENT_1_QUESTIONS } from '../data/webinarAssessment1Questions';

export default function WebinarAssessment1({ onComplete }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(() => {
    const initial = {};
    WEBINAR_ASSESSMENT_1_QUESTIONS.forEach((q) => {
      initial[q.id] = '';
    });
    return initial;
  });
  const [submitted, setSubmitted] = useState(false);

  const setAnswer = useCallback((questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const questions = WEBINAR_ASSESSMENT_1_QUESTIONS;
  const currentQuestion = questions[questionIndex];
  const allAnswered = questions.every((q) => (answers[q.id] || '').trim() !== '');
  const isLast = questionIndex === questions.length - 1;

  const handleSubmit = useCallback(() => {
    if (!allAnswered) return;
    setSubmitted(true);
    onComplete?.();
  }, [allAnswered, onComplete]);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-navy/10 text-primary-navy mb-4">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-primary-navy">Assessment 1 completed</h2>
        <p className="mt-2 text-sm text-gray-600 max-w-sm">
          You can move on to the next session or assessment in the sidebar.
        </p>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 px-1 pb-4">
        <h2 className="text-lg font-semibold text-gray-800">Assessment 1</h2>
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
            Submit Assessment 1
          </button>
        )}
      </div>
    </div>
  );
}
