import { useCallback, useEffect, useMemo, useState } from 'react';
import { getWebinarAssessmentHistory, submitWebinarAssessment } from '../../../utils/api';

const LAST_ATTEMPT_KEY = (id) => `webinar_last_attempt_${id}`;

function formatAttemptDate(value) {
  if (!value) return 'Unknown time';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Unknown time';
  return d.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStoredLastAttempt(assessmentId) {
  try {
    const raw = localStorage.getItem(LAST_ATTEMPT_KEY(assessmentId));
    if (!raw) return null;
    const stored = JSON.parse(raw);
    if (stored && typeof stored.score === 'number' && typeof stored.total === 'number') {
      return { ...stored, _id: 'local' };
    }
  } catch (e) {
    /* ignore */
  }
  return null;
}

function setStoredLastAttempt(assessmentId, payload) {
  try {
    localStorage.setItem(LAST_ATTEMPT_KEY(assessmentId), JSON.stringify(payload));
  } catch (e) {
    /* ignore */
  }
}

export default function WebinarAssessmentTemplate({
  assessmentId,
  title,
  description,
  questions,
  estimatedTime = '5 mins',
  onComplete,
  nextLabel,
  onGoNext,
  webinarToken,
}) {
  const createInitialAnswers = useCallback(() => {
    const initial = {};
    questions.forEach((q) => {
      initial[q.id] = '';
    });
    return initial;
  }, [questions]);

  const [mode, setMode] = useState('intro');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(() => createInitialAnswers());
  const [report, setReport] = useState(null);
  const [saving, setSaving] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  const currentQuestion = questions[questionIndex];
  const currentAnswered = currentQuestion && (answers[currentQuestion.id] || '').trim() !== '';
  const allAnswered = useMemo(
    () => questions.every((q) => (answers[q.id] || '').trim() !== ''),
    [questions, answers]
  );
  const isLast = questionIndex === questions.length - 1;

  const loadAttempts = useCallback(async () => {
    setLoadingAttempts(true);
    try {
      let list = [];
      if (webinarToken) {
        const result = await getWebinarAssessmentHistory(assessmentId, webinarToken, 6);
        if (result?.success && result.data != null) {
          const payload = result.data?.data ?? result.data;
          const raw = Array.isArray(payload?.attempts) ? payload.attempts : [];
          list = raw.slice(0, 1);
        }
      }
      if (list.length === 0) {
        const stored = getStoredLastAttempt(assessmentId);
        if (stored) list = [stored];
      }
      setAttempts(list);
    } catch (e) {
      console.warn('[WebinarAssessmentTemplate] history fetch failed', e);
      const stored = getStoredLastAttempt(assessmentId);
      setAttempts(stored ? [stored] : []);
    } finally {
      setLoadingAttempts(false);
    }
  }, [assessmentId, webinarToken]);

  useEffect(() => {
    loadAttempts();
  }, [loadAttempts]);

  const setAnswer = useCallback((questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleStart = useCallback(() => {
    setQuestionIndex(0);
    setAnswers(createInitialAnswers());
    setReport(null);
    setMode('inProgress');
  }, [createInitialAnswers]);

  const handleRetake = useCallback(() => {
    setQuestionIndex(0);
    setAnswers(createInitialAnswers());
    setReport(null);
    setMode('inProgress');
  }, [createInitialAnswers]);

  const handleSubmit = useCallback(async () => {
    if (!allAnswered) return;
    setSaving(true);
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
    const total = questions.length;
    let submittedAt = new Date().toISOString();
    try {
      const res = await submitWebinarAssessment(
        assessmentId,
        { score, total, results, answers },
        webinarToken
      );
      submittedAt = res?.data?.data?.submittedAt ?? res?.data?.submittedAt ?? submittedAt;
    } catch (e) {
      console.warn('[WebinarAssessmentTemplate] save failed', e);
    } finally {
      setSaving(false);
    }
    onComplete?.();
    setReport({ score, total, results, submittedAt });
    setMode('report');
    setStoredLastAttempt(assessmentId, { score, total, submittedAt });
    loadAttempts();
  }, [allAnswered, answers, assessmentId, loadAttempts, onComplete, questions, webinarToken]);

  const handleContinue = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  const handleGoNext = useCallback(() => {
    onComplete?.();
    onGoNext?.();
  }, [onComplete, onGoNext]);

  if (mode === 'intro') {
    return (
      <div className="flex flex-col h-full min-h-0 gap-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-navy/10 text-primary-navy text-xs font-semibold tracking-wide mb-4">
            Assessment
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl">{description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
              {estimatedTime}
            </span>
            <span className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
              {questions.length} questions
            </span>
          </div>
          <button
            type="button"
            onClick={handleStart}
            className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white bg-primary-navy hover:bg-primary-navy/90 transition-colors"
          >
            Start assessment
            <span aria-hidden>→</span>
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Previous attempts</h3>
            <span className="text-xs text-gray-500">{attempts.length} shown</span>
          </div>
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {loadingAttempts ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                Loading attempts...
              </div>
            ) : attempts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/70 p-5 text-sm text-gray-500 text-center">
                No previous attempts yet.
              </div>
            ) : (
              attempts.map((attempt, idx) => {
                const percentage = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;
                return (
                  <div
                    key={attempt._id || attempt.id || `${String(attempt.submittedAt || '')}-${idx}`}
                    className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {idx === 0 ? 'Latest attempt' : `Attempt ${idx + 1}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{formatAttemptDate(attempt.submittedAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary-navy">
                        {attempt.score}/{attempt.total}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-primary-navy/10 text-primary-navy px-2.5 py-0.5 text-xs font-medium mt-1">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'report' && report) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="flex flex-col items-center px-6 py-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-navy/10 text-primary-navy mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-primary-navy">{title} completed</h2>
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

        <div className="shrink-0 pt-5 mt-auto flex flex-col gap-3">
          <button
            type="button"
            onClick={handleRetake}
            className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition border border-gray-200"
          >
            Retake assessment
          </button>
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
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{estimatedTime} · {questions.length} questions</p>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>
            Question {questionIndex + 1} of {questions.length}
          </span>
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
            disabled={!currentAnswered}
            className="flex-1 py-2.5 px-4 bg-primary-navy hover:bg-primary-navy/90 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered || saving}
            className="flex-1 py-2.5 px-4 bg-primary-navy hover:bg-primary-navy/90 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Submitting...' : `Submit ${title}`}
          </button>
        )}
      </div>
    </div>
  );
}
