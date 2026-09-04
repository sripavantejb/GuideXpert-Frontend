import { Fragment, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiCopy, FiUsers } from 'react-icons/fi';
import { ADMIN_VIEW_ALL_LIMIT } from '../../../constants/adminListLimits';
import { UserDetailPanel } from '../../../pages/admin/WebinarProgress';
import {
  MODULE_LABELS,
  MOTION_EASE,
  initialsFromName,
  rowStatus,
  timeAgo,
  formatDateTime,
} from '../../../pages/admin/webinar-progress/webinarProgressShared';

const STATUS_PILL = {
  completed: 'bg-emerald-50 text-emerald-700',
  in_progress: 'bg-amber-50 text-amber-700',
  not_started: 'bg-slate-100 text-slate-500',
};

const STATUS_LABEL = {
  completed: 'Completed',
  in_progress: 'In progress',
  not_started: 'Not started',
};

const BAR_COLOR = {
  completed: 'bg-emerald-500',
  in_progress: 'bg-primary-navy',
  not_started: 'bg-slate-200',
};

function sortActive(field, sort) {
  const cur = sort.startsWith('-') ? sort.slice(1) : sort;
  return cur === field;
}

export default function StudentTable({
  users,
  setUsers,
  loading,
  total,
  page,
  setPage,
  viewAll,
  setViewAll,
  listLimit,
  totalPages,
  f,
  toggleSort,
  expandedPhone,
  setExpandedPhone,
  selectedPhones,
  allPageSelected,
  somePageSelected,
  toggleSelectAllPage,
  toggleSelectOne,
  api,
  reducedMotion,
  staggerRows,
}) {
  const copiedRef = useRef('');

  const copyPhone = async (phone) => {
    try {
      await navigator.clipboard.writeText(phone);
      copiedRef.current = phone;
    } catch {
      /* ignore */
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-[0_8px_30px_rgba(4,30,48,0.05)] backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
            <tr className="border-b border-slate-100">
              <th className="px-4 py-3.5">
                <input
                  type="checkbox"
                  aria-label="Select all on page"
                  checked={allPageSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = somePageSelected && !allPageSelected;
                  }}
                  onChange={toggleSelectAllPage}
                  className="rounded border-slate-300 text-primary-navy"
                />
              </th>
              <th className="px-3 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Trainee</th>
              <th className="px-3 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Phone</th>
              <th className="px-3 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Joined</th>
              <th className="px-3 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <button type="button" onClick={() => toggleSort('overallPercent')} className="inline-flex items-center gap-1 hover:text-slate-700">
                  Progress
                  <FiChevronDown className={`h-3.5 w-3.5 ${sortActive('overallPercent', f.sort) ? 'opacity-100' : 'opacity-30'}`} />
                </button>
              </th>
              <th className="px-3 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</th>
              <th className="px-3 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Module</th>
              <th className="px-3 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <button type="button" onClick={() => toggleSort('modulesDone')} className="inline-flex items-center gap-1 hover:text-slate-700">
                  Modules
                  <FiChevronDown className={`h-3.5 w-3.5 ${sortActive('modulesDone', f.sort) ? 'opacity-100' : 'opacity-30'}`} />
                </button>
              </th>
              <th className="px-3 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <button type="button" onClick={() => toggleSort('lastActivityAt')} className="inline-flex items-center gap-1 hover:text-slate-700">
                  Last active
                  <FiChevronDown className={`h-3.5 w-3.5 ${sortActive('lastActivityAt', f.sort) ? 'opacity-100' : 'opacity-30'}`} />
                </button>
              </th>
              <th className="w-16 px-3 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  {Array.from({ length: 10 }).map((__, j) => (
                    <td key={j} className="px-3 py-4">
                      <div className="h-4 animate-pulse rounded bg-slate-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-0">
                  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-navy/8 text-primary-navy">
                      <FiUsers className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">No trainees in 26–27 yet</p>
                    <p className="mt-1 max-w-sm text-xs text-slate-400">
                      This list stays empty until someone logs into the webinar. Returning 25–26 people start from zero here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u, index) => {
                const isExpanded = expandedPhone === u.phone;
                const done = u.modulesDone != null ? u.modulesDone : (u.completedModules || []).length;
                const status = rowStatus(u.overallPercent ?? 0);
                const RowTag = staggerRows && !reducedMotion ? motion.tr : 'tr';
                const rowProps =
                  staggerRows && !reducedMotion
                    ? {
                        initial: { opacity: 0, y: 8 },
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.3, ease: MOTION_EASE, delay: Math.min(index, 12) * 0.03 },
                      }
                    : {};

                return (
                  <Fragment key={u.phone}>
                    <RowTag
                      {...rowProps}
                      className="group border-b border-slate-50 transition hover:bg-primary-navy/[0.03]"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedPhones.has(u.phone)}
                          onChange={() => toggleSelectOne(u.phone)}
                          className="rounded border-slate-300 text-primary-navy"
                          aria-label={`Select ${u.fullName || u.phone}`}
                        />
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-navy text-[11px] font-semibold text-white">
                            {initialsFromName(u.fullName)}
                          </span>
                          <span className="text-sm font-medium text-slate-800">{u.fullName || '—'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 font-mono text-[13px] text-slate-600">{u.phone}</td>
                      <td className="px-3 py-4 text-xs text-slate-500">{formatDateTime(u.firstJoinedAt)}</td>
                      <td className="px-3 py-4">
                        <div className="flex min-w-[120px] items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <motion.div
                              className={`h-full rounded-full ${BAR_COLOR[status]}`}
                              initial={{ width: reducedMotion ? `${u.overallPercent || 0}%` : 0 }}
                              animate={{ width: `${Math.min(100, u.overallPercent || 0)}%` }}
                              transition={{ duration: reducedMotion ? 0 : 0.5, ease: MOTION_EASE, delay: reducedMotion ? 0 : 0.15 }}
                            />
                          </div>
                          <span className="w-8 text-right text-xs font-semibold tabular-nums text-slate-700">
                            {u.overallPercent ?? 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_PILL[status]}`}>
                          {STATUS_LABEL[status]}
                        </span>
                      </td>
                      <td className="max-w-[160px] truncate px-3 py-4 text-xs text-slate-600">
                        {u.lastActiveModule ? MODULE_LABELS[u.lastActiveModule] || u.lastActiveModule : '—'}
                      </td>
                      <td className="px-3 py-4 text-right text-xs font-medium tabular-nums text-slate-700">{done}/11</td>
                      <td className="px-3 py-4 text-right text-xs text-slate-500">{timeAgo(u.lastActivityAt)}</td>
                      <td className="px-3 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            title="Copy phone"
                            onClick={() => copyPhone(u.phone)}
                            className="rounded-lg p-1.5 text-slate-400 opacity-100 transition hover:bg-slate-100 hover:text-slate-700 md:opacity-0 md:group-hover:opacity-100"
                          >
                            <FiCopy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedPhone(isExpanded ? null : u.phone)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            aria-expanded={isExpanded}
                          >
                            <FiChevronDown className={`h-4 w-4 transition ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </RowTag>
                    {isExpanded && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={10} className="p-0">
                          <div className="border-t border-slate-100">
                            <UserDetailPanel
                              user={u}
                              api={api}
                              onUserUpdated={(updated) => {
                                setUsers((prev) =>
                                  prev.map((p) => (p.phone === updated.phone ? { ...p, ...updated } : p))
                                );
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {viewAll ? (
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
          <p className="text-xs text-slate-500">
            {total > ADMIN_VIEW_ALL_LIMIT
              ? `Showing first ${ADMIN_VIEW_ALL_LIMIT.toLocaleString()} of ${total}`
              : `Showing all ${total} trainees`}
          </p>
          <button
            type="button"
            onClick={() => {
              setViewAll(false);
              setPage(1);
            }}
            className="text-xs font-semibold text-primary-navy"
          >
            Back to pages
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
          <p className="text-xs text-slate-500">
            {total === 0 ? '0 trainees' : `Page ${page} of ${totalPages} · ${total} total`}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
            >
              <FiChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
