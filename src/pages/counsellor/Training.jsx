import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiExternalLink, FiLock } from 'react-icons/fi';
import {
  useCounsellorTraining,
  TRAINING_MODULES,
  TOTAL_MODULES,
} from '../../contexts/CounsellorTrainingContext';
import { useCounsellorProfile } from '../../contexts/CounsellorProfileContext';
import { useWebinarAuth } from '../../contexts/WebinarAuthContext';
import { ALL_MODULES } from '../../pages/webinar/data/mockWebinarData';
import { getWebinarProgress } from '../../utils/api';
import { getCounsellorToken, getCounsellorWebinarProgress } from '../../utils/counsellorApi';
import TrainingProgressOverview from '../../components/Counsellor/TrainingProgressOverview';
import CertificatePreview from '../../components/Counsellor/CertificatePreview';

const CERTIFICATE_MODULE_ID = 14;
const PREREQ_MODULE_ID = 13;

const WEBINAR_DISPLAY_MODULES = ALL_MODULES.map((m) => ({
  id: m.id,
  label: m.title,
  type: m.type === 'Assessment' ? 'assessment' : 'video',
}));

/** Normalize apiRequest / counsellorRequest body: { success, data: doc } */
function extractWebinarDoc(res) {
  if (!res?.success || res.data == null) return undefined;
  const payload = res.data;
  if (typeof payload !== 'object' || payload === null) return undefined;
  if (Object.prototype.hasOwnProperty.call(payload, 'data')) return payload.data;
  return payload;
}

export default function CounsellorTraining() {
  const { token: webinarToken, logout: webinarLogout } = useWebinarAuth();
  const { markCompleted, completedModules, totalModules } = useCounsellorTraining();
  const { displayName, phone: profilePhone } = useCounsellorProfile();

  const phoneKey = useMemo(() => {
    const d = String(profilePhone || '').replace(/\D/g, '').slice(-10);
    return d.length === 10 ? d : '';
  }, [profilePhone]);

  const [webinarProgressState, setWebinarProgressState] = useState(() => ({
    status: /** @type {'loading' | 'ready'} */ ('loading'),
    source: /** @type {'backend' | 'fallback'} */ ('fallback'),
    backendKind: /** @type {null | 'counsellor-db' | 'webinar-token'} */ (null),
    completedModules: /** @type {string[]} */ ([]),
    overallPercent: /** @type {number | null} */ (null),
  }));

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setWebinarProgressState((prev) => ({ ...prev, status: 'loading' }));

      const cToken = getCounsellorToken();
      if (!cToken) {
        if (!cancelled) {
          setWebinarProgressState({
            status: 'ready',
            source: 'fallback',
            backendKind: null,
            completedModules: [],
            overallPercent: null,
          });
        }
        return;
      }

      const cRes = await getCounsellorWebinarProgress(cToken);
      if (cancelled) return;

      if (cRes.success) {
        const doc = extractWebinarDoc(cRes);
        const done = Array.isArray(doc?.completedModules)
          ? doc.completedModules.map((x) => String(x))
          : [];
        const overallPercent =
          typeof doc?.overallPercent === 'number' && !Number.isNaN(doc.overallPercent)
            ? doc.overallPercent
            : null;
        setWebinarProgressState({
          status: 'ready',
          source: 'backend',
          backendKind: 'counsellor-db',
          completedModules: done,
          overallPercent,
        });
        return;
      }

      if (webinarToken) {
        const wRes = await getWebinarProgress(webinarToken);
        if (cancelled) return;
        if (wRes.status === 401) {
          webinarLogout();
        }
        if (wRes.success) {
          const doc = extractWebinarDoc(wRes);
          const done = Array.isArray(doc?.completedModules)
            ? doc.completedModules.map((x) => String(x))
            : [];
          const overallPercent =
            typeof doc?.overallPercent === 'number' && !Number.isNaN(doc.overallPercent)
              ? doc.overallPercent
              : null;
          setWebinarProgressState({
            status: 'ready',
            source: 'backend',
            backendKind: 'webinar-token',
            completedModules: done,
            overallPercent,
          });
          return;
        }
      }

      if (!cancelled) {
        setWebinarProgressState({
          status: 'ready',
          source: 'fallback',
          backendKind: null,
          completedModules: [],
          overallPercent: null,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [webinarToken, phoneKey]);

  const useBackendUi =
    webinarProgressState.status === 'loading' || webinarProgressState.source === 'backend';
  const overviewLoading = webinarProgressState.status === 'loading';

  /** Backend stores string ids; getModuleState expects numeric ids like localStorage progress */
  const progressForModuleState = useMemo(() => {
    if (webinarProgressState.source === 'backend' && webinarProgressState.status === 'ready') {
      const ids = new Set();
      for (const x of webinarProgressState.completedModules) {
        const n = Number(x);
        if (Number.isInteger(n) && n >= 1 && n <= TOTAL_MODULES) ids.add(n);
      }
      return [...ids].sort((a, b) => a - b);
    }
    return completedModules;
  }, [
    webinarProgressState.source,
    webinarProgressState.status,
    webinarProgressState.completedModules,
    completedModules,
  ]);

  const syncBadgeLabel = useMemo(() => {
    if (webinarProgressState.status === 'loading') return undefined;
    if (webinarProgressState.source === 'backend') {
      if (webinarProgressState.backendKind === 'counsellor-db') return 'Admin training records';
      if (webinarProgressState.backendKind === 'webinar-token') return 'Synced from webinar';
      return undefined;
    }
    return 'Local progress';
  }, [webinarProgressState]);

  const isCertificateUnlocked = useMemo(() => {
    const completedSet = new Set(progressForModuleState);
    for (let moduleId = 1; moduleId < CERTIFICATE_MODULE_ID; moduleId += 1) {
      if (!completedSet.has(moduleId)) return false;
    }
    return true;
  }, [progressForModuleState]);
  const certificateLocked = !isCertificateUnlocked;
  const issuedDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div id="main-content" className="flex flex-col min-h-0 max-w-5xl mx-auto w-full">
      <TrainingProgressOverview
        source={useBackendUi ? 'backend' : 'fallback'}
        loading={overviewLoading}
        modules={useBackendUi ? WEBINAR_DISPLAY_MODULES : TRAINING_MODULES}
        completedModules={
          useBackendUi ? webinarProgressState.completedModules : completedModules
        }
        totalModules={useBackendUi ? ALL_MODULES.length : totalModules}
        completionPercentOverride={useBackendUi ? webinarProgressState.overallPercent : null}
        syncBadgeLabel={syncBadgeLabel}
      />

      {!certificateLocked && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-card overflow-hidden">
            <div className="border-b border-gray-100 bg-linear-to-r from-primary-navy/5 to-transparent px-6 py-4">
              <div className="flex items-center gap-2">
                <FiAward className="w-5 h-5 text-primary-navy shrink-0" aria-hidden />
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Your certificate</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    GuideXpert Certified Career Counsellor
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 flex flex-col items-center">
              <div
                className="w-full flex justify-center overflow-hidden rounded-lg bg-slate-50/80 py-2"
                style={{ height: 300 }}
              >
                <div className="origin-top scale-[0.35] sm:scale-[0.42] md:scale-[0.48]">
                  <CertificatePreview
                    recipientName={displayName || 'Counsellor'}
                    date={issuedDate}
                    signatureName="GuideXpert"
                  />
                </div>
              </div>
              <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <Link
                  to="/counsellor/certificate"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-navy text-white text-sm font-semibold hover:bg-primary-navy/90 transition-colors shadow-sm"
                >
                  Download certified counsellor poster
                  <FiExternalLink className="w-4 h-4 opacity-90" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white shadow-card p-6">
            <p className="text-sm text-gray-600 mb-4">
              Mark this step complete when you have saved or shared your certificate.
            </p>
            <button
              type="button"
              onClick={() => markCompleted(CERTIFICATE_MODULE_ID)}
              className="px-4 py-2 rounded-lg bg-accent-green text-white text-sm font-semibold hover:bg-accent-green/90 transition-colors"
            >
              Mark as completed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
