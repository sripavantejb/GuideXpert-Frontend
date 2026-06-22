import { useCallback, useEffect, useState } from 'react';
import {
  FiBookOpen,
  FiEdit3,
  FiMessageSquare,
  FiPenTool,
  FiZap,
} from 'react-icons/fi';
import KpiCard from '../../../components/Admin/KpiCard';
import StatCardSkeleton from '../../../components/UI/CardSkeleton';
import { fetchAllCopilotLearning } from '../../../utils/humanCopilotApi';
import {
  formatPercentRate,
  getEditClassificationLabel,
  getEditTopicLabel,
  PANEL_CLASS,
  truncateText,
} from './copilotUtils';

const PERIOD_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
];

function Section({ title, children }) {
  return (
    <section className={`${PANEL_CLASS} p-4 sm:p-5`}>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div
      className={`${PANEL_CLASS} flex items-center justify-between gap-3 border-red-200/80 bg-red-50/80 p-4 text-sm text-red-800`}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100"
      >
        Retry
      </button>
    </div>
  );
}

function ClassificationBadge({ value }) {
  const tones = {
    unchanged: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    minor_edit: 'bg-blue-100 text-blue-800 border-blue-200',
    moderate_edit: 'bg-amber-100 text-amber-900 border-amber-200',
    major_rewrite: 'bg-red-100 text-red-800 border-red-200',
    manual: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        tones[value] || tones.manual
      }`}
    >
      {getEditClassificationLabel(value)}
    </span>
  );
}

export default function CopilotLearningPanel() {
  const [sinceDays, setSinceDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await fetchAllCopilotLearning(sinceDays);
    if (!result.success) {
      setError(result.message || 'Failed to load learning data');
      setData(null);
    } else {
      setData(result);
    }
    setLoading(false);
  }, [sinceDays]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className={`${PANEL_CLASS} p-4`}>
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={load} />;
  }

  const overview = data?.overview || {};
  const breakdown = overview.editBreakdown || {};
  const topics = data?.topics?.topics || [];
  const patterns = data?.editPatterns?.patterns || [];
  const examples = data?.examples?.examples || [];

  return (
    <div className="space-y-4">
      <div className={`${PANEL_CLASS} flex flex-wrap items-center justify-between gap-3 p-4`}>
        <div>
          <p className="text-sm font-medium text-slate-900">Learning from counsellor edits</p>
          <p className="text-xs text-slate-500">
            Internal dataset of how SR counsellors modify AI suggestions
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Time period">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSinceDays(opt.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                sinceDays === opt.value
                  ? 'border-primary-blue-300 bg-primary-blue-50 text-primary-blue-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Section title="Reply source mix">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard
            label="AI used"
            value={formatPercentRate((overview.aiUsedPercent || 0) / 100)}
            icon={FiZap}
            accent="hero"
            subtitle={`${overview.totalSent || 0} sent replies`}
          />
          <KpiCard
            label="AI edited"
            value={formatPercentRate((overview.aiEditedPercent || 0) / 100)}
            icon={FiEdit3}
          />
          <KpiCard
            label="Manual"
            value={formatPercentRate((overview.manualPercent || 0) / 100)}
            icon={FiMessageSquare}
          />
        </div>
      </Section>

      <Section title="Edit intensity">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard label="Minor edits" value={breakdown.minorEdit ?? 0} icon={FiPenTool} />
          <KpiCard label="Moderate edits" value={breakdown.moderateEdit ?? 0} icon={FiEdit3} accent />
          <KpiCard label="Major rewrites" value={breakdown.majorRewrite ?? 0} icon={FiBookOpen} />
        </div>
      </Section>

      <Section title="Top topics requiring edits">
        <div className={`${PANEL_CLASS} overflow-hidden border-slate-200`}>
          {topics.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-500">No edited topics in this period.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {topics.slice(0, 8).map((topic) => (
                <li
                  key={topic.key}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                >
                  <span className="font-medium text-slate-800">{topic.label}</span>
                  <span className="tabular-nums text-slate-600">
                    {topic.editCount} edits{' '}
                    <span className="text-slate-400">({topic.count} replies)</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>

      {patterns.length > 0 ? (
        <Section title="Common edit patterns">
          <div className={`${PANEL_CLASS} overflow-hidden border-slate-200`}>
            <ul className="divide-y divide-slate-100">
              {patterns.map((pattern) => (
                <li
                  key={pattern.key}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                >
                  <span className="font-medium text-slate-800">{pattern.label}</span>
                  <span className="tabular-nums text-slate-600">{pattern.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      ) : null}

      <Section title="Recent examples">
        {examples.length === 0 ? (
          <p className={`${PANEL_CLASS} px-4 py-3 text-sm text-slate-500`}>
            No AI-assisted reply examples in this period.
          </p>
        ) : (
          <div className="space-y-3">
            {examples.map((example) => (
              <article
                key={`${example.handoffId}-${example.sentAt}`}
                className={`${PANEL_CLASS} space-y-3 p-4`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <ClassificationBadge value={example.editClassification} />
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    {getEditTopicLabel(example.editTopic)}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      AI suggestion
                    </p>
                    <p className="mt-1 text-slate-700">
                      {truncateText(example.suggestedText || '—', 220)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Human reply
                    </p>
                    <p className="mt-1 text-slate-900">
                      {truncateText(example.humanReply || '—', 280)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
