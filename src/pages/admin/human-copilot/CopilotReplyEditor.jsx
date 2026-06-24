import { FiLoader, FiRefreshCw, FiSend, FiZap, FiCheckCircle } from 'react-icons/fi';
import {
  getDeliveryStatusLabel,
  getDeliveryStatusTone,
  normalizeDeliveryStatus,
  PANEL_CLASS,
  shouldShowRetryBar,
} from './copilotUtils';

export default function CopilotReplyEditor({
  handoff,
  replyText,
  onReplyTextChange,
  onSuggest,
  onSend,
  onResolve,
  onRetry,
  suggesting,
  sending,
  resolving,
  retrying,
  disabled,
  deliveryStatus,
  suggestNotice,
  suggestions = [],
  onPickSuggestion,
  embedded = false,
}) {
  const shellClass = embedded
    ? 'shrink-0 border-t border-slate-200/60 bg-[#f0f2f5] p-2.5'
    : `${PANEL_CLASS} p-4 space-y-3`;

  if (!handoff) {
    return (
      <section
        className={
          embedded
            ? 'shrink-0 border-t border-slate-200/60 bg-[#f0f2f5] p-2.5 text-sm text-slate-500'
            : `${PANEL_CLASS} p-4 text-sm text-slate-500`
        }
      >
        Select a conversation to reply.
      </section>
    );
  }

  const failedReply = handoff.failedReply;
  const showRetry = shouldShowRetryBar(handoff, deliveryStatus);
  const normalizedDelivery = normalizeDeliveryStatus(deliveryStatus);
  const deliveryLabel = normalizedDelivery ? getDeliveryStatusLabel(normalizedDelivery) : '';
  const deliveryTone = normalizedDelivery ? getDeliveryStatusTone(normalizedDelivery) : '';

  const suggestionPicker =
    suggestions.length > 1 ? (
      <div className="mb-2 flex flex-wrap gap-1.5">
        {suggestions.map((item, idx) => (
          <button
            key={`${idx}-${item.text?.slice(0, 12)}`}
            type="button"
            onClick={() => onPickSuggestion?.(item.text)}
            className="max-w-full rounded-lg border border-violet-200 bg-white px-2 py-1 text-left text-[11px] text-violet-900 hover:bg-violet-50"
            title={item.text}
          >
            <span className="font-medium">#{idx + 1}</span>
            {item.confidence != null ? (
              <span className="ml-1 text-violet-600">{Math.round(item.confidence * 100)}%</span>
            ) : null}
          </button>
        ))}
      </div>
    ) : suggestions.length === 1 && suggestions[0]?.confidence != null ? (
      <p className="mb-2 text-[11px] text-violet-700">
        AI confidence: {Math.round(suggestions[0].confidence * 100)}%
      </p>
    ) : null;

  if (embedded) {
    return (
      <section className={shellClass}>
        {suggestNotice ? (
          <p className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
            {suggestNotice}
          </p>
        ) : null}

        {suggestionPicker}

        {showRetry ? (
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-800">
            <span>
              Send failed{failedReply.errorMessage ? `: ${failedReply.errorMessage}` : ''}. Draft
              preserved.
            </span>
            <button
              type="button"
              onClick={onRetry}
              disabled={retrying || disabled}
              className="inline-flex items-center gap-1 rounded-md border border-red-300 bg-white px-2 py-1 font-medium hover:bg-red-100 disabled:opacity-50"
            >
              <FiRefreshCw className="h-3 w-3" />
              {retrying ? 'Retrying…' : 'Retry'}
            </button>
          </div>
        ) : null}

        <div className="flex items-end gap-2">
          <textarea
            value={replyText}
            onChange={(e) => onReplyTextChange(e.target.value)}
            rows={2}
            placeholder="Type a WhatsApp reply…"
            disabled={disabled || sending}
            className="min-h-[2.75rem] flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-blue-300 focus:outline-none focus:ring-2 focus:ring-primary-blue-100 disabled:bg-slate-50"
          />
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {deliveryLabel ? (
              <span
                className={`inline-block max-w-[7.5rem] whitespace-normal rounded-full border px-2 py-0.5 text-center text-[9px] font-medium leading-tight ${deliveryTone}`}
                title={deliveryLabel}
              >
                {deliveryLabel}
              </span>
            ) : null}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onSuggest}
                disabled={suggesting || disabled}
                title="Suggest reply"
                aria-label="Suggest reply"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-100 disabled:opacity-50"
              >
                {suggesting ? (
                  <FiLoader className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <FiZap className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={onSend}
                disabled={sending || !replyText.trim() || disabled}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary-blue-600 px-4 text-xs font-medium text-white hover:bg-primary-blue-700 disabled:opacity-50"
              >
                <FiSend className="h-4 w-4" />
                {sending ? '…' : 'Send'}
              </button>
              <button
                type="button"
                onClick={onResolve}
                disabled={resolving || disabled}
                title="Resolve conversation"
                aria-label="Resolve conversation"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
              >
                <FiCheckCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={shellClass}>
      {suggestNotice ? (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {suggestNotice}
        </p>
      ) : null}

      {suggestionPicker}

      {showRetry ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 flex flex-wrap items-center justify-between gap-2">
          <span>
            Send failed{failedReply.errorMessage ? `: ${failedReply.errorMessage}` : ''}. Draft
            preserved.
          </span>
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying || disabled}
            className="inline-flex items-center gap-1 rounded-md border border-red-300 bg-white px-2 py-1 font-medium hover:bg-red-100 disabled:opacity-50"
          >
            <FiRefreshCw className="h-3 w-3" />
            {retrying ? 'Retrying…' : 'Retry send'}
          </button>
        </div>
      ) : null}

      <textarea
        value={replyText}
        onChange={(e) => onReplyTextChange(e.target.value)}
        rows={4}
        placeholder="Type a WhatsApp reply…"
        disabled={disabled || sending}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-blue-300 focus:outline-none focus:ring-2 focus:ring-primary-blue-100 disabled:bg-slate-50"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSuggest}
          disabled={suggesting || disabled}
          className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-medium text-violet-900 hover:bg-violet-100 disabled:opacity-50"
        >
          {suggesting ? <FiLoader className="h-3.5 w-3.5 animate-spin" /> : <FiZap className="h-3.5 w-3.5" />}
          {suggesting ? 'Suggesting…' : 'Suggest reply'}
        </button>
        <button
          type="button"
          onClick={onSend}
          disabled={sending || !replyText.trim() || disabled}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-primary-blue-700 disabled:opacity-50"
        >
          <FiSend className="h-3.5 w-3.5" />
          {sending ? 'Sending…' : 'Send'}
        </button>
        <button
          type="button"
          onClick={onResolve}
          disabled={resolving || disabled}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-900 hover:bg-emerald-100 disabled:opacity-50"
        >
          <FiCheckCircle className="h-3.5 w-3.5" />
          {resolving ? 'Resolving…' : 'Resolve'}
        </button>
      </div>
    </section>
  );
}
