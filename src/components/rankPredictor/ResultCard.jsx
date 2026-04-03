function ResultCard({ result }) {
  if (!result) return null;

  return (
    <div className="mt-4 min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm sm:mt-5 sm:p-6">
      <p className="break-words text-sm font-medium text-emerald-700">{result.metricLabel}</p>
      <p className="mt-1 break-words text-2xl font-extrabold tabular-nums text-emerald-900 sm:text-3xl">
        {result.predictedRank}
      </p>
      <p className="mt-3 break-words text-sm text-emerald-800">Range: {result.range}</p>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
        <div className="h-full w-3/4 rounded-full bg-emerald-500" />
      </div>
      <p className="mt-3 break-words text-sm leading-relaxed text-emerald-900">{result.message}</p>
    </div>
  );
}

export default ResultCard;
