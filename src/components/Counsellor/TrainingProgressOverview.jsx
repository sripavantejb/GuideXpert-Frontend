import { useNavigate } from 'react-router-dom';
import { FiCheck, FiLock, FiPlay } from 'react-icons/fi';
import { getModuleState } from '../../contexts/CounsellorTrainingContext';
import { isModuleUnlocked, getUnlockProgress } from '../../pages/webinar/utils/unlockLogic';

const WEBINAR_PLATFORM_URL = 'https://gxrewards.guidexpert.co.in/guide-xpert';

/**
 * @typedef {'backend' | 'fallback'} ProgressSource
 */

/**
 * @param {object} props
 * @param {ProgressSource} props.source
 * @param {boolean} [props.loading]
 * @param {Array<{ id: string|number, label: string, type?: string }>} props.modules
 * @param {(string|number)[]} props.completedModules
 * @param {number} props.totalModules
 * @param {number | null} [props.completionPercentOverride] — from backend overallPercent when present
 * @param {string} [props.syncBadgeLabel] — e.g. admin records vs webinar token vs local
 */
export default function TrainingProgressOverview({
  source,
  loading = false,
  modules,
  completedModules,
  totalModules,
  completionPercentOverride = null,
  syncBadgeLabel,
}) {
  const navigate = useNavigate();

  const completedIdsForWebinar =
    source === 'backend'
      ? completedModules.map((id) => String(id))
      : completedModules.map((id) => String(id));

  const getWebinarChipState = (modId) => {
    const id = String(modId);
    if (completedIdsForWebinar.includes(id)) return 'completed';
    if (isModuleUnlocked(id, completedIdsForWebinar)) return 'unlocked';
    return 'locked';
  };

  let completedCount;
  let completionPercent;

  if (source === 'backend') {
    const { completed, percent } = getUnlockProgress(completedIdsForWebinar);
    completedCount = completed;
    if (completionPercentOverride != null && !Number.isNaN(completionPercentOverride)) {
      completionPercent = Math.min(100, Math.max(0, Math.round(completionPercentOverride)));
    } else {
      completionPercent = percent;
    }
  } else {
    completedCount = completedModules.length;
    completionPercent = totalModules ? Math.round((completedCount / totalModules) * 100) : 0;
  }

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference;

  const goToFallbackModule = (moduleId) => {
    navigate(`/counsellor/training?module=${moduleId}`, { replace: true });
    const main = document.getElementById('main-content');
    if (main) main.scrollIntoView({ behavior: 'smooth' });
  };

  const goToWebinarPortal = () => {
    navigate('/webinar');
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-card p-6 min-w-0 mb-6">
      <div className="rounded-xl border border-primary-navy/15 bg-linear-to-r from-primary-navy/6 to-white p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-gray-900">Webinar platform</h3>
          <p className="text-sm text-gray-600 mt-1">
            Open GuideXpert live sessions in one place.
          </p>
        </div>
        <a
          href={WEBINAR_PLATFORM_URL}
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-navy text-white text-sm font-semibold hover:bg-primary-navy/90 transition-colors shadow-sm"
        >
          Open platform
        </a>
      </div>

      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
          Your training progress
        </h2>
        {source === 'backend' && !loading && syncBadgeLabel && (
          <span className="text-xs font-medium text-primary-navy bg-primary-navy/10 px-2 py-0.5 rounded-full">
            {syncBadgeLabel}
          </span>
        )}
        {source === 'fallback' && !loading && (
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {syncBadgeLabel || 'Local progress'}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 min-w-0 mb-6 relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70">
            <p className="text-sm text-gray-600 font-medium">Loading webinar progress…</p>
          </div>
        )}
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-primary-navy transition-all duration-500"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-800">
            {completionPercent}%
          </span>
        </div>
        <div className="text-sm text-gray-600 text-center sm:text-left">
          <p>
            <span className="font-semibold text-gray-800">{completedCount}</span> of {totalModules}{' '}
            modules completed
          </p>
          <p className="mt-1 text-gray-500">
            Finish all modules to unlock your certificate and poster download.
          </p>
        </div>
      </div>

      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Modules</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {modules.map((mod) => {
          let state;
          let lockedBlocked;
          let certificateLockedNavigable = false;

          if (source === 'backend') {
            state = getWebinarChipState(mod.id);
            lockedBlocked = state === 'locked';
          } else {
            state = getModuleState(mod.id, completedModules);
            certificateLockedNavigable = state === 'locked' && mod.type === 'certificate';
            lockedBlocked = state === 'locked' && !certificateLockedNavigable;
          }

          const handleClick = () => {
            if (lockedBlocked || loading) return;
            if (source === 'backend') {
              goToWebinarPortal();
            } else {
              goToFallbackModule(mod.id);
            }
          };

          return (
            <button
              key={String(mod.id)}
              type="button"
              onClick={handleClick}
              disabled={lockedBlocked || loading}
              title={
                lockedBlocked
                  ? 'Complete the previous module first'
                  : source === 'backend'
                    ? `Continue in ${mod.label} — opens webinar portal`
                    : `Open ${mod.label}`
              }
              className={`flex items-center gap-2 min-w-0 rounded-lg border px-2.5 py-2 text-left transition-colors w-full ${
                lockedBlocked || loading
                  ? 'border-gray-100 bg-gray-50/80 opacity-75 cursor-not-allowed'
                  : 'border-gray-100 bg-gray-50/80 hover:bg-primary-navy/5 hover:border-primary-navy/20 cursor-pointer'
              }`}
            >
              <span className="shrink-0 w-5 h-5 flex items-center justify-center">
                {state === 'completed' && <FiCheck className="w-4 h-4 text-accent-green" aria-hidden />}
                {state === 'locked' && <FiLock className="w-3.5 h-3.5 text-gray-400" aria-hidden />}
                {state === 'unlocked' && <FiPlay className="w-3.5 h-3.5 text-primary-navy" aria-hidden />}
              </span>
              <span className="text-xs font-medium text-gray-800 truncate">{mod.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
