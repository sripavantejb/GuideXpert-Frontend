import { motion } from 'framer-motion';
import { FiRefreshCw, FiDownload } from 'react-icons/fi';
import { MOTION_EASE } from '../../../pages/admin/webinar-progress/webinarProgressShared';

export default function CommandHeader({
  reducedMotion,
  onRefresh,
  onExport,
  refreshing,
  exporting,
}) {
  return (
    <motion.header
      initial={reducedMotion ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: MOTION_EASE }}
      className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-navy/70">
          26–27 cohort
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">
          Training progress
        </h1>
        <p className="mt-1 max-w-xl text-sm text-slate-500">
          Live counsellor training for this year. New webinar logins appear here.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-primary-navy/20 hover:bg-white disabled:opacity-50"
        >
          <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-navy px-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-navy/90 disabled:opacity-50"
        >
          <FiDownload className="h-4 w-4" />
          {exporting ? 'Exporting…' : 'Export'}
        </button>
      </div>
    </motion.header>
  );
}
