import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiCopy,
  FiEye,
  FiPhone,
  FiSearch,
  FiTarget,
  FiTrendingUp,
  FiCheckCircle,
  FiX,
  FiUser,
} from 'react-icons/fi';
import { getAdminLeads, getLead, updateLeadNotes, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../hooks/useAuth';
import { useAdminDateRange } from '../../hooks/useAdminDateRange';
import TableSkeleton from '../../components/UI/TableSkeleton';
import { ContentSkeleton } from '../../components/UI/Skeleton';
import { RANK_PREDICTOR_LEAD_UTM } from '../../utils/rankPredictorLeadConstants';
import { COLLEGE_PREDICTOR_LEAD_UTM } from '../../utils/collegePredictorLeadConstants';
import { copyTextToClipboard } from '../../utils/clipboard';

const TABS = [
  {
    id: 'rank',
    label: 'Rank Predictor',
    utm: RANK_PREDICTOR_LEAD_UTM.utm_content,
    icon: FiTrendingUp,
    accent: 'orange',
    description: 'Students who verified phone on the rank predictor',
  },
  {
    id: 'college',
    label: 'College Predictor',
    utm: COLLEGE_PREDICTOR_LEAD_UTM.utm_content,
    icon: FiSearch,
    accent: 'rose',
    description: 'Students who verified phone on the college predictor',
  },
];

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  return (
    date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' +
    date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  );
}

function formatRankSummary(lead) {
  const r = lead?.rankPredictorLead;
  if (!r || typeof r !== 'object') return null;
  const exam = r.examId || '—';
  const score = r.score != null && r.score !== '' ? String(r.score) : null;
  let predicted = null;
  if (r.predictedValue !== undefined && r.predictedValue !== null && r.predictedValue !== '') {
    predicted =
      typeof r.predictedValue === 'number'
        ? r.predictedValue.toLocaleString('en-IN')
        : String(r.predictedValue);
  }
  let range = null;
  if (
    r.rangeLow != null &&
    r.rangeHigh != null &&
    Number.isFinite(Number(r.rangeLow)) &&
    Number.isFinite(Number(r.rangeHigh))
  ) {
    range = `${Number(r.rangeLow).toLocaleString('en-IN')}–${Number(r.rangeHigh).toLocaleString('en-IN')}`;
  }
  return { exam, score, predicted, range, metricLabel: r.metricLabel || null, difficulty: r.difficulty || null };
}

function formatCollegeSummary(lead) {
  const c = lead?.collegePredictorLead;
  if (!c || typeof c !== 'object') return null;
  return {
    exam: c.exam || '—',
    matchCount: c.matchCount != null ? c.matchCount : null,
    predictedAt: c.predictedAt || null,
    filterSnapshot: c.filterSnapshot || null,
  };
}

function StatCard({ label, value, hint, icon: Icon, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-50 text-slate-600 ring-slate-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    orange: 'bg-orange-50 text-orange-700 ring-orange-100',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100',
  };
  return (
    <div className={`rounded-2xl ring-1 p-4 ${tones[tone] || tones.slate}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">{value}</p>
          {hint ? <p className="mt-1 text-xs opacity-70">{hint}</p> : null}
        </div>
        {Icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 shadow-sm">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Dedicated admin view for organic student predictor leads (name + phone after OTP).
 * Rank and College tabs — cleaner than the full counsellor Lead Funnel table.
 */
export default function OrganicPredictorLeads() {
  const { logout } = useAuth();
  const { dateRange } = useAdminDateRange();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'college' ? 'college' : 'rank';
  const [tab, setTab] = useState(initialTab);
  const activeTab = TABS.find((t) => t.id === tab) || TABS[0];

  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [q, setQ] = useState('');
  const searchInputRef = useRef(null);
  const cancelledRef = useRef(false);
  const requestIdRef = useRef(0);

  const [detailLead, setDetailLead] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailNotes, setDetailNotes] = useState('');
  const [detailSaving, setDetailSaving] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    const next = searchParams.get('tab') === 'college' ? 'college' : 'rank';
    setTab(next);
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => setQ(searchDraft.trim()), 300);
    return () => clearTimeout(t);
  }, [searchDraft]);

  const selectTab = (id) => {
    setTab(id);
    setPagination((p) => ({ ...p, page: 1 }));
    const next = new URLSearchParams(searchParams);
    next.set('tab', id);
    setSearchParams(next, { replace: true });
  };

  const loadLeads = useCallback(() => {
    cancelledRef.current = false;
    requestIdRef.current += 1;
    const thisRequestId = requestIdRef.current;
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      utm_content: activeTab.utm,
      ...(dateRange.from && { from: dateRange.from }),
      ...(dateRange.to && { to: dateRange.to }),
      ...(q ? { q } : {}),
    };
    setLoading(true);
    setError('');
    getAdminLeads(params, getStoredToken()).then((result) => {
      if (cancelledRef.current || thisRequestId !== requestIdRef.current) return;
      setLoading(false);
      if (!result.success) {
        if (result.status === 401) {
          logout();
          return;
        }
        setError(result.message || 'Failed to load leads');
        setLeads([]);
        return;
      }
      setLeads(result.data?.data || []);
      setPagination((prev) => ({
        ...prev,
        ...(result.data?.pagination || {}),
      }));
    });
  }, [activeTab.utm, dateRange.from, dateRange.to, q, pagination.page, pagination.limit, logout]);

  useEffect(() => {
    loadLeads();
    return () => {
      cancelledRef.current = true;
    };
  }, [loadLeads]);

  const stats = useMemo(() => {
    const otpVerified = leads.filter((l) => l.otpVerified).length;
    const withPrediction =
      tab === 'rank'
        ? leads.filter((l) => l.rankPredictorLead?.predictedValue != null || l.rankPredictorLead?.examId).length
        : leads.filter((l) => l.collegePredictorLead?.exam || l.collegePredictorLead?.matchCount != null).length;
    return {
      total: pagination.total,
      otpVerified,
      withPrediction,
      pageCount: leads.length,
    };
  }, [leads, pagination.total, tab]);

  const openDetail = (leadId) => {
    setDetailLead(null);
    setDetailNotes('');
    setDetailLoading(true);
    getLead(leadId, getStoredToken()).then((res) => {
      setDetailLoading(false);
      if (res.success && res.data?.data) {
        setDetailLead(res.data.data);
        setDetailNotes(res.data.data.adminNotes || '');
      }
    });
  };

  const closeDetail = () => {
    setDetailLead(null);
    setDetailNotes('');
  };

  const saveNotes = () => {
    if (!detailLead?.id || detailSaving) return;
    setDetailSaving(true);
    updateLeadNotes(detailLead.id, detailNotes, getStoredToken()).then((res) => {
      setDetailSaving(false);
      if (res.success && res.data?.data) {
        setDetailLead(res.data.data);
        setDetailNotes(res.data.data.adminNotes || '');
        setLeads((prev) =>
          prev.map((l) => (l.id === detailLead.id ? { ...l, adminNotes: res.data.data.adminNotes } : l))
        );
      }
    });
  };

  const copyPhone = (phone) => {
    if (!phone) return;
    copyTextToClipboard(phone).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 1500);
    });
  };

  return (
    <div className="mx-auto max-w-[1280px] px-1">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Student tools</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Predictor leads</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Name and mobile numbers captured after OTP on the student portal predictors — similar to influencer lead
          follow-up, focused on organic student traffic.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {TABS.map((t) => {
          const Icon = t.icon;
          const selected = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => selectTab(t.id)}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors min-w-[160px] ${
                selected
                  ? t.accent === 'rose'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {t.label}
            </button>
          );
        })}
      </div>

      <p className="mb-4 text-sm text-slate-500">{activeTab.description}</p>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Total leads"
          value={stats.total.toLocaleString('en-IN')}
          hint="Matching current filters"
          icon={FiUser}
          tone="slate"
        />
        <StatCard
          label="OTP verified (page)"
          value={stats.otpVerified.toLocaleString('en-IN')}
          hint={`of ${stats.pageCount} on this page`}
          icon={FiCheckCircle}
          tone="emerald"
        />
        <StatCard
          label={tab === 'rank' ? 'With rank data' : 'With college data'}
          value={stats.withPrediction.toLocaleString('en-IN')}
          hint="On this page"
          icon={FiTarget}
          tone={tab === 'college' ? 'rose' : 'orange'}
        />
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search name or phone…"
              value={searchDraft}
              onChange={(e) => {
                setSearchDraft(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <p className="text-xs text-slate-500">
            Date range uses the admin header Filters. Tag:{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-700">{activeTab.utm}</code>
          </p>
        </div>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[880px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Student</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">OTP</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Exam</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {tab === 'rank' ? 'Prediction' : 'Matches'}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Created</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                      No predictor leads found for this tab and date range.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const rank = formatRankSummary(lead);
                    const college = formatCollegeSummary(lead);
                    return (
                      <tr key={lead.id} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                                tab === 'college' ? 'bg-rose-50 text-rose-700' : 'bg-orange-50 text-orange-700'
                              }`}
                            >
                              {(lead.fullName || '?').slice(0, 1).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">{lead.fullName || '—'}</p>
                              <p className="truncate text-xs text-slate-500">{lead.occupation || 'Student tool lead'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FiPhone className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                            <span className="font-medium tabular-nums text-slate-800">{lead.phone || '—'}</span>
                            {lead.phone ? (
                              <button
                                type="button"
                                onClick={() => copyPhone(lead.phone)}
                                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                aria-label={`Copy phone for ${lead.fullName || 'lead'}`}
                              >
                                <FiCopy className="h-3.5 w-3.5" />
                              </button>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {lead.otpVerified ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {tab === 'rank' ? rank?.exam || '—' : college?.exam || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {tab === 'rank' ? (
                            rank?.predicted ? (
                              <div>
                                <p className="font-semibold tabular-nums text-slate-900">
                                  {rank.metricLabel ? `${rank.metricLabel}: ` : ''}
                                  {rank.predicted}
                                </p>
                                {rank.range ? <p className="text-xs text-slate-500">Range {rank.range}</p> : null}
                                {rank.score != null ? (
                                  <p className="text-xs text-slate-500">
                                    Score {rank.score}
                                    {rank.difficulty ? ` · ${rank.difficulty}` : ''}
                                  </p>
                                ) : null}
                              </div>
                            ) : rank?.score != null ? (
                              <span className="text-xs text-slate-500">Score {rank.score} (awaiting output)</span>
                            ) : (
                              '—'
                            )
                          ) : college?.matchCount != null ? (
                            <span className="font-semibold tabular-nums text-slate-900">
                              {Number(college.matchCount).toLocaleString('en-IN')} colleges
                            </span>
                          ) : college?.exam ? (
                            <span className="text-xs text-slate-500">Profile saved</span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                          {formatDate(lead.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => openDetail(lead.id)}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors ${
                              tab === 'college'
                                ? 'text-rose-700 hover:bg-rose-50'
                                : 'text-orange-700 hover:bg-orange-50'
                            }`}
                          >
                            <FiEye className="h-4 w-4" /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm">
              <p className="text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))
                  }
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {(detailLoading || detailLead) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {detailLoading ? (
              <div className="p-6">
                <ContentSkeleton lines={6} />
              </div>
            ) : detailLead ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{detailLead.fullName || 'Lead details'}</h3>
                    <p className="text-xs text-slate-500">{activeTab.label} · organic student lead</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeDetail}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    aria-label="Close"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                  <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</p>
                        <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-900">
                          {detailLead.phone || '—'}
                        </p>
                      </div>
                      {detailLead.phone ? (
                        <button
                          type="button"
                          onClick={() => copyPhone(detailLead.phone)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <FiCopy className="h-3.5 w-3.5" />
                          {copyFeedback ? 'Copied' : 'Copy'}
                        </button>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          detailLead.otpVerified
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {detailLead.otpVerified ? 'OTP verified' : 'OTP pending'}
                      </span>
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {detailLead.occupation || '—'}
                      </span>
                    </div>
                  </div>

                  {tab === 'rank' && detailLead.rankPredictorLead ? (
                    <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-orange-700/80">
                        Rank prediction
                      </p>
                      <dl className="mt-2 grid gap-2 text-sm">
                        <div className="flex justify-between gap-3">
                          <dt className="text-slate-500">Exam</dt>
                          <dd className="font-medium text-slate-900">
                            {detailLead.rankPredictorLead.examId || '—'}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-slate-500">Score</dt>
                          <dd className="font-medium text-slate-900">
                            {detailLead.rankPredictorLead.score ?? '—'}
                            {detailLead.rankPredictorLead.difficulty
                              ? ` · ${detailLead.rankPredictorLead.difficulty}`
                              : ''}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-slate-500">Predicted</dt>
                          <dd className="font-semibold text-slate-900">
                            {detailLead.rankPredictorLead.predictedValue ?? '—'}
                          </dd>
                        </div>
                        {detailLead.rankPredictorLead.rangeLow != null &&
                        detailLead.rankPredictorLead.rangeHigh != null ? (
                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-500">Range</dt>
                            <dd className="font-medium text-slate-900">
                              {detailLead.rankPredictorLead.rangeLow}–{detailLead.rankPredictorLead.rangeHigh}
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    </div>
                  ) : null}

                  {tab === 'college' && detailLead.collegePredictorLead ? (
                    <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-rose-700/80">
                        College prediction
                      </p>
                      <dl className="mt-2 grid gap-2 text-sm">
                        <div className="flex justify-between gap-3">
                          <dt className="text-slate-500">Exam</dt>
                          <dd className="font-medium text-slate-900">
                            {detailLead.collegePredictorLead.exam || '—'}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-slate-500">Matches</dt>
                          <dd className="font-semibold text-slate-900">
                            {detailLead.collegePredictorLead.matchCount != null
                              ? Number(detailLead.collegePredictorLead.matchCount).toLocaleString('en-IN')
                              : '—'}
                          </dd>
                        </div>
                        {detailLead.collegePredictorLead.predictedAt ? (
                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-500">Predicted at</dt>
                            <dd className="text-slate-800">
                              {formatDate(detailLead.collegePredictorLead.predictedAt)}
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Created</p>
                      <p className="font-medium text-slate-800">{formatDate(detailLead.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Updated</p>
                      <p className="font-medium text-slate-800">{formatDate(detailLead.updatedAt)}</p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="organic-lead-notes" className="mb-1 block text-sm font-medium text-slate-700">
                      Admin notes
                    </label>
                    <textarea
                      id="organic-lead-notes"
                      rows={4}
                      value={detailNotes}
                      onChange={(e) => setDetailNotes(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                      placeholder="Follow-up notes for this student…"
                    />
                    <button
                      type="button"
                      onClick={saveNotes}
                      disabled={detailSaving}
                      className={`mt-2 inline-flex rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                        tab === 'college' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-orange-500 hover:bg-orange-600'
                      }`}
                    >
                      {detailSaving ? 'Saving…' : 'Save notes'}
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
