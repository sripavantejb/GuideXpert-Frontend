import { useState, useCallback } from 'react';
import { EXAM_OPTIONS, mockRankFromMarks } from '../../data/studentDashboardMock';

export default function RankPredictorPanel() {
  const [examId, setExamId] = useState(EXAM_OPTIONS[0].id);
  const [marks, setMarks] = useState('185');
  const [result, setResult] = useState(() =>
    mockRankFromMarks(185, EXAM_OPTIONS[0].id),
  );

  const predict = useCallback(() => {
    const m = Number(marks);
    if (Number.isNaN(m) || m < 0) {
      setResult(null);
      return;
    }
    setResult(mockRankFromMarks(m, examId));
  }, [marks, examId]);

  return (
    <section
      id="rank-predictor"
      className="scroll-mt-24 border-b-2 border-black bg-[#F8FAFC] px-4 py-14 sm:px-6 lg:px-8"
      aria-labelledby="rank-predictor-heading"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="rank-predictor-heading"
          className="sd-font-display text-2xl font-extrabold text-[#0F172A] sm:text-3xl"
          style={{ fontWeight: 800 }}
        >
          Rank Predictor
        </h2>
        <p className="mt-2 text-slate-600">
          Demo predictor—enter exam and marks to see mock rank and percentile.
        </p>
        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="sd-card-brutal overflow-hidden bg-white p-0">
            <div className="h-2 w-full border-b-2 border-black bg-[#C7F36B]" />
            <div className="p-6">
              <label htmlFor="rank-exam" className="block text-sm font-bold text-[#0F172A]">
                Exam name
              </label>
              <select
                id="rank-exam"
                className="sd-input mt-2"
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
              >
                {EXAM_OPTIONS.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
              <label htmlFor="rank-marks" className="mt-4 block text-sm font-bold text-[#0F172A]">
                Marks
              </label>
              <input
                id="rank-marks"
                type="number"
                min={0}
                max={360}
                className="sd-input mt-2"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
              />
              <button type="button" className="sd-btn-primary mt-6 w-full sm:w-auto" onClick={predict}>
                Predict Rank
              </button>
            </div>
          </div>
          {result && (
            <div
              key={`${result.predictedRank}-${result.percentile}`}
              className="sd-result-fade-in sd-card-brutal overflow-hidden border-[#000] bg-[#B7E5FF]/40 p-6"
            >
              <div className="rounded-lg border-2 border-black bg-[#C7F36B] px-4 py-2 text-center text-sm font-extrabold uppercase tracking-wide text-[#0F172A]">
                Result
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000]">
                  <p className="text-xs font-bold uppercase text-slate-500">Predicted Rank</p>
                  <p className="sd-font-display mt-1 text-3xl font-extrabold tabular-nums">
                    {result.predictedRank.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000]">
                  <p className="text-xs font-bold uppercase text-slate-500">Percentile</p>
                  <p className="sd-font-display mt-1 text-3xl font-extrabold tabular-nums">{result.percentile}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
