function RankForm({
  exam,
  score,
  difficulty,
  onScoreChange,
  onDifficultyChange,
  onSubmit,
  loading,
  error,
}) {
  return (
    <form onSubmit={onSubmit} className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
        {exam.title || `${exam.name} Rank Predictor`}
      </h2>
      <p className="mt-1 text-sm text-gray-600">Enter your score and get an instant prediction.</p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{exam.scoreLabel}</label>
          <input
            type="number"
            value={score}
            min={exam.minScore}
            max={exam.maxScore}
            step={exam.step || 1}
            onChange={(e) => onScoreChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-navy focus:outline-none"
            placeholder={`Enter ${exam.scoreLabel.toLowerCase()}`}
          />
          <p className="mt-1 text-xs text-gray-500">Allowed range: {exam.minScore} - {exam.maxScore}</p>
        </div>

        {exam.requiresDifficulty && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Difficulty Level</label>
            <select
              value={difficulty}
              onChange={(e) => onDifficultyChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-navy focus:outline-none"
            >
              {exam.difficultyOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 w-full min-h-11 rounded-lg bg-primary-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-navy/90 disabled:opacity-50 sm:mt-6 sm:w-auto"
      >
        {loading ? 'Predicting...' : 'Predict Rank'}
      </button>
    </form>
  );
}

export default RankForm;
