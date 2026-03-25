function ResultCard({ result }) {
  if (!result) return null;

  return (
    <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
      <p className="text-sm font-medium text-emerald-700">{result.metricLabel}</p>
      <p className="mt-1 text-3xl font-extrabold text-emerald-900">{result.predictedRank}</p>
      <p className="mt-3 text-sm text-emerald-800">Range: {result.range}</p>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
        <div className="h-full w-3/4 rounded-full bg-emerald-500" />
      </div>
      <p className="mt-3 text-sm text-emerald-900">{result.message}</p>
    </div>
  );
}

export default ResultCard;
