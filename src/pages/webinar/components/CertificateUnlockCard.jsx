import { FiCheck, FiLock } from 'react-icons/fi';

const CARD_CLASS = 'rounded-xl bg-white border border-gray-200 shadow-card overflow-hidden p-3 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5';

export default function CertificateUnlockCard({
  completedPercent = 0,
  totalSessions = 0,
  completedSessions = 0,
}) {
  const unlocked = completedPercent >= 100;
  const remaining = Math.max(0, totalSessions - completedSessions);

  return (
    <div className={CARD_CLASS}>
      <header className="mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Certificate progress
        </h3>
      </header>
      {unlocked ? (
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200 min-w-0">
            <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <FiCheck className="w-4 h-4 text-green-700" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-green-800 leading-tight">Certificate ready</p>
              <p className="text-xs text-green-700 leading-tight mt-0.5">You have completed all sessions.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center min-h-[40px] px-3 py-2 rounded-lg bg-primary-navy text-white text-xs font-medium hover:bg-primary-navy/90 transition-colors w-full"
            >
              Download PNG
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center min-h-[40px] px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors w-full"
            >
              Download PDF
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center min-h-[40px] px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors w-full"
            >
              Share on LinkedIn
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 font-medium">Certificate progress</span>
            <span className="font-semibold text-gray-900 tabular-nums">{completedPercent}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden w-full">
            <div
              className="h-full rounded-full bg-primary-navy transition-all duration-300"
              style={{ width: `${completedPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-600">
            Complete {remaining} more session{remaining !== 1 ? 's' : ''} to unlock.
          </p>
          <p className="text-[10px] text-gray-500">Unlocks when all days are complete.</p>
          <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 min-w-0">
            <span className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0 flex-shrink-0">
              <FiLock className="w-4 h-4 text-gray-500" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-700">Certificate of Completion</p>
              <p className="text-[10px] text-gray-500">Unlock after completing Day 3</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
