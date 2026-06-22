import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiClock, FiSend, FiSkipForward } from 'react-icons/fi';
import KpiCard from '../../../components/Admin/KpiCard';
import StatCardSkeleton from '../../../components/UI/CardSkeleton';
import {
  fetchRecommendedFollowups,
  sendFollowupMessage,
  skipFollowupSuggestion,
} from '../../../utils/humanCopilotApi';
import {
  formatFollowupDelay,
  formatPercentRate,
  getFollowupPriorityLabel,
  PANEL_CLASS,
} from './copilotUtils';

const PERIOD_OPTIONS = [
  { value: 1, label: '1 day inactive' },
  { value: 3, label: '3 days inactive' },
  { value: 7, label: '7 days inactive' },
];

function PrioritySection({ title, items, draftMessages, onDraftChange, onSend, onSkip, actingId }) {
  if (!items.length) {
    return (
      <section className={`${PANEL_CLASS} p-4 sm:p-5`}>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          {title}
        </h2>
        <p className="text-sm text-slate-500">No suggestions in this bucket.</p>
      </section>
    );
  }

  return (
    <section className={`${PANEL_CLASS} p-4 sm:p-5`}>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </h2>
      <div className="space-y-3">
        {items.map((item) => {
          const draft = draftMessages[item.id] ?? item.suggestedMessage;
          const isActing = actingId === item.id;
          return (
            <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{item.purpose}</p>
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 border border-slate-200">
                  {getFollowupPriorityLabel(item.priority)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Delay: {formatFollowupDelay(item.recommendedDelayDays)} · {item.category}
                {item.phone ? ` · ${item.phone}` : ''}
              </p>
              <textarea
                className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                rows={4}
                value={draft}
                onChange={(e) => onDraftChange(item.id, e.target.value)}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isActing}
                  onClick={() => onSend(item, draft)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-blue-700 disabled:opacity-60"
                >
                  <FiSend className="h-3.5 w-3.5" />
                  {isActing ? 'Sending…' : 'Send message'}
                </button>
                <button
                  type="button"
                  disabled={isActing}
                  onClick={() => onSkip(item)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  <FiSkipForward className="h-3.5 w-3.5" />
                  Skip
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function CopilotFollowupPanel() {
  const [inactiveDays, setInactiveDays] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [draftMessages, setDraftMessages] = useState({});
  const [actingId, setActingId] = useState('');
  const [actionNotice, setActionNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setActionNotice('');
    const result = await fetchRecommendedFollowups(inactiveDays);
    if (!result.success) {
      setError(result.message || 'Failed to load follow-ups');
      setData(null);
    } else {
      setData(result);
      const drafts = {};
      for (const item of result.data?.items || []) {
        drafts[item.id] = item.suggestedMessage;
      }
      setDraftMessages(drafts);
    }
    setLoading(false);
  }, [inactiveDays]);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(
    () =>
      data?.data?.grouped || {
        high: [],
        medium: [],
        low: [],
      },
    [data]
  );

  const analytics = data?.data?.analytics || {};

  const handleDraftChange = (id, value) => {
    setDraftMessages((prev) => ({ ...prev, [id]: value }));
  };

  const handleSend = async (item, message) => {
    setActingId(item.id);
    setActionNotice('');
    const result = await sendFollowupMessage(item.handoffId, {
      followupId: item.id,
      message,
      lockVersion: item.lockVersion,
    });
    setActingId('');
    if (!result.success) {
      setActionNotice(result.message || 'Failed to send follow-up');
      return;
    }
    setActionNotice('Follow-up sent. The message was delivered via counsellor approval.');
    await load();
  };

  const handleSkip = async (item) => {
    setActingId(item.id);
    setActionNotice('');
    const result = await skipFollowupSuggestion(item.handoffId, item.id);
    setActingId('');
    if (!result.success) {
      setActionNotice(result.message || 'Failed to skip follow-up');
      return;
    }
    await load();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`${PANEL_CLASS} flex items-center justify-between gap-3 border-red-200/80 bg-red-50/80 p-4 text-sm text-red-800`}
      >
        <span>{error}</span>
        <button
          type="button"
          onClick={load}
          className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`${PANEL_CLASS} flex flex-wrap items-center justify-between gap-3 p-4`}>
        <div>
          <p className="text-sm font-medium text-slate-900">Follow-up Assistant</p>
          <p className="text-xs text-slate-500">
            AI suggests follow-ups for counsellor review. Nothing is sent automatically.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setInactiveDays(opt.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                inactiveDays === opt.value
                  ? 'border-primary-blue-300 bg-primary-blue-50 text-primary-blue-800'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {actionNotice ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {actionNotice}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Sent" value={analytics.sentCount ?? 0} icon={FiSend} />
        <KpiCard label="Skipped" value={analytics.skippedCount ?? 0} icon={FiSkipForward} />
        <KpiCard
          label="Response rate"
          value={formatPercentRate(analytics.responseRate || 0)}
          icon={FiClock}
          subtitle="After counsellor-approved follow-ups"
        />
      </div>

      <PrioritySection
        title="High priority"
        items={grouped.high || []}
        draftMessages={draftMessages}
        onDraftChange={handleDraftChange}
        onSend={handleSend}
        onSkip={handleSkip}
        actingId={actingId}
      />
      <PrioritySection
        title="Medium priority"
        items={grouped.medium || []}
        draftMessages={draftMessages}
        onDraftChange={handleDraftChange}
        onSend={handleSend}
        onSkip={handleSkip}
        actingId={actingId}
      />
      <PrioritySection
        title="Low priority"
        items={grouped.low || []}
        draftMessages={draftMessages}
        onDraftChange={handleDraftChange}
        onSend={handleSend}
        onSkip={handleSkip}
        actingId={actingId}
      />
    </div>
  );
}
