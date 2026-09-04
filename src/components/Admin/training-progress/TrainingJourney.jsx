import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiClipboard, FiPlay, FiStar, FiAlertTriangle } from 'react-icons/fi';
import {
  TIMELINE_IDS,
  ASSESSMENT_IDS,
  MODULE_LABELS,
  SHORT_MODULE_LABELS,
  MOTION_EASE,
} from '../../../pages/admin/webinar-progress/webinarProgressShared';

function nodeState(pct) {
  if (pct >= 100) return 'completed';
  if (pct > 0) return 'in_progress';
  return 'not_started';
}

function Milestone({ id, index, count, enrolled, reduced }) {
  const pct = enrolled > 0 ? Math.round((count / enrolled) * 100) : 0;
  const state = nodeState(pct);
  const isAssessment = id.startsWith('a');
  const isCert = id === 'certificate';
  const Icon = isCert ? FiAward : isAssessment ? FiClipboard : FiPlay;

  const ring =
    state === 'completed'
      ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]'
      : state === 'in_progress'
        ? 'border-primary-navy bg-white text-primary-navy shadow-[0_0_0_4px_rgba(0,51,102,0.12)]'
        : 'border-slate-200 bg-slate-50 text-slate-400';

  const bar =
    state === 'completed'
      ? 'bg-emerald-400'
      : isAssessment
        ? 'bg-amber-400'
        : 'bg-primary-blue-400';

  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: MOTION_EASE, delay: reduced ? 0 : 0.04 * index }}
      className="relative flex min-w-[108px] flex-1 flex-col items-center"
      title={`${MODULE_LABELS[id]} — ${count} of ${enrolled} completed (${pct}%)`}
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 ${ring}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-2 text-center text-[11px] font-semibold text-slate-700">
        {SHORT_MODULE_LABELS[id] || id}
      </p>
      <p className="mt-0.5 text-[10px] tabular-nums text-slate-400">
        {pct}% · {count}
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className={`h-full rounded-full ${bar}`}
          initial={{ width: reduced ? `${pct}%` : 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: reduced ? 0 : 0.55, ease: MOTION_EASE, delay: reduced ? 0 : 0.12 + 0.03 * index }}
        />
      </div>
    </motion.li>
  );
}

export default function TrainingJourney({ stats, loading, reducedMotion }) {
  const [showInsights, setShowInsights] = useState(false);
  const enrolled = stats?.totalEnrolled ?? 0;
  const perModule = stats?.perModuleCompletion || {};
  const analytics = stats?.assessmentAnalytics || {};
  const empty = !loading && enrolled === 0;

  const assessmentsWithData = ASSESSMENT_IDS.filter((id) => analytics[id]);
  let hardest = null;
  let best = null;
  if (assessmentsWithData.length > 0) {
    hardest = assessmentsWithData.reduce((a, b) =>
      analytics[a].avgScorePct < analytics[b].avgScorePct ? a : b
    );
    best = assessmentsWithData.reduce((a, b) =>
      analytics[a].avgScorePct > analytics[b].avgScorePct ? a : b
    );
    if (hardest === best) hardest = null;
  }

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: MOTION_EASE, delay: reducedMotion ? 0 : 0.12 }}
      className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-[0_8px_30px_rgba(4,30,48,0.05)] backdrop-blur-md sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Training journey</h2>
          <p className="mt-0.5 text-xs text-slate-500">Sessions and assessments as cohort milestones</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-medium text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary-navy" /> In progress
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-300" /> Not started
          </span>
          <button
            type="button"
            onClick={() => setShowInsights((v) => !v)}
            className="rounded-lg px-2 py-1 text-[11px] font-semibold text-primary-navy hover:bg-primary-navy/5"
          >
            {showInsights ? 'Hide' : 'Show'} assessment insights
          </button>
        </div>
      </div>

      {loading && !stats ? (
        <div className="mt-6 h-28 animate-pulse rounded-xl bg-slate-100" />
      ) : empty ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center">
          <p className="text-sm font-medium text-slate-600">Journey not started</p>
          <p className="mt-1 text-xs text-slate-400">Milestones fill in as 26–27 trainees complete modules.</p>
        </div>
      ) : (
        <ol className="mt-6 flex gap-2 overflow-x-auto pb-2 md:gap-3">
          {TIMELINE_IDS.map((id, index) => (
            <Milestone
              key={id}
              id={id}
              index={index}
              count={perModule[id] || 0}
              enrolled={enrolled}
              reduced={reducedMotion}
            />
          ))}
        </ol>
      )}

      {showInsights && (
        <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-3">
          {ASSESSMENT_IDS.map((id) => {
            const data = analytics[id];
            return (
              <div key={id} className="rounded-xl bg-slate-50/80 px-4 py-3">
                <p className="text-[11px] font-semibold text-slate-700">{MODULE_LABELS[id]}</p>
                {data ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Avg {data.avgScorePct}% · {data.uniqueAttempters} attempters · {data.highScorers} high scorers
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-400">No attempts yet</p>
                )}
              </div>
            );
          })}
          {hardest && (
            <div className="flex items-center gap-3 rounded-xl bg-red-50/70 px-4 py-3 sm:col-span-1">
              <FiAlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400">Hardest</p>
                <p className="text-xs font-medium text-red-700">
                  {MODULE_LABELS[hardest]} ({analytics[hardest].avgScorePct}%)
                </p>
              </div>
            </div>
          )}
          {best && (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50/70 px-4 py-3">
              <FiStar className="h-4 w-4 shrink-0 text-emerald-500" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Best</p>
                <p className="text-xs font-medium text-emerald-700">
                  {MODULE_LABELS[best]} ({analytics[best].avgScorePct}%)
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.section>
  );
}
