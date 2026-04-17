function formatRange(range) {
  if (range == null || range === '') return '—';
  if (typeof range === 'string') return range;
  if (typeof range === 'object' && range.low != null && range.high != null) {
    return `${Number(range.low).toLocaleString()} – ${Number(range.high).toLocaleString()}`;
  }
  return String(range);
}

function formatPredictedValue(v) {
  if (v == null || v === '') return '—';
  if (typeof v === 'number' && Number.isFinite(v)) return v.toLocaleString();
  return String(v);
}

function ResultCard({ result }) {
  if (!result) return null;

  const predicted = result.predictedRank ?? result.predictedValue;

  return (
    <div className="mt-4 min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm sm:mt-5 sm:p-6">
      <p className="break-words text-sm font-medium text-emerald-700">{result.metricLabel}</p>
      <p className="mt-1 break-words text-2xl font-extrabold tabular-nums text-emerald-900 sm:text-3xl">
        {formatPredictedValue(predicted)}
      </p>
      <p className="mt-3 break-words text-sm text-emerald-800">Range: {formatRange(result.range)}</p>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
        <div className="h-full w-3/4 rounded-full bg-emerald-500" />
      </div>
      <p className="mt-3 break-words text-sm leading-relaxed text-emerald-900">{result.message}</p>
    </div>
  );
}

export default ResultCard;
