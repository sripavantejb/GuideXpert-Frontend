import { FiInbox } from 'react-icons/fi';
import {
  buildQueueFilterOptions,
  formatAssignee,
  formatCopilotDate,
  getAlertLabel,
  getAlertTone,
  getCopilotStateLabel,
  PANEL_CLASS,
  truncateText,
} from './copilotUtils';

export default function CopilotQueuePanel({
  items,
  loading,
  error,
  selectedId,
  srFilter,
  onSrFilterChange,
  onSelect,
  onRetry,
  filterOptions,
}) {
  const options = filterOptions || buildQueueFilterOptions();
  return (
    <section className={`${PANEL_CLASS} flex h-full min-h-0 flex-col overflow-hidden`}>
      <div className="border-b border-slate-200/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <FiInbox className="h-4 w-4 text-primary-blue-600" aria-hidden />
          <h2 className="text-sm font-semibold text-slate-900">Pending queue</h2>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSrFilterChange(opt.value)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                srFilter === opt.value
                  ? 'border-primary-blue-300 bg-primary-blue-50 text-primary-blue-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading && items.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">Loading queue…</p>
        ) : error ? (
          <div className="m-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <p>{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 text-xs font-medium underline"
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">No open handoffs in the queue.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => {
              const active = item.id === selectedId;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={`w-full px-4 py-3 text-left transition ${
                      active ? 'bg-primary-blue-50/80' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900 tabular-nums">
                          {item.phone}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {truncateText(item.userLastMessage, 60) || 'No message preview'}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] uppercase tracking-wide text-slate-400">
                        {getCopilotStateLabel(item.copilotState || item.status)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600">
                        {formatAssignee(item)}
                      </span>
                      {(item.alertReasons || []).map((reason) => (
                        <span
                          key={reason}
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getAlertTone(reason)}`}
                        >
                          {getAlertLabel(reason)}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[10px] text-slate-400">
                      {formatCopilotDate(item.createdAt)}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
