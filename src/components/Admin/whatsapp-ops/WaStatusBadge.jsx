const tone = {
  submitted: 'bg-sky-100 text-sky-900 border-sky-200',
  sent: 'bg-cyan-100 text-cyan-950 border-cyan-200',
  delivered: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  read: 'bg-indigo-100 text-indigo-900 border-indigo-200',
  failed: 'bg-rose-100 text-rose-900 border-rose-200',
  retry_exhausted: 'bg-amber-100 text-amber-950 border-amber-200',
  retry_pending: 'bg-violet-100 text-violet-900 border-violet-200',
  queued: 'bg-gray-100 text-gray-800 border-gray-200',
  default: 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function WaStatusBadge({ status }) {
  const s = (status || 'unknown').toString().toLowerCase();
  const cls = tone[s] || tone.default;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {status || '—'}
    </span>
  );
}
