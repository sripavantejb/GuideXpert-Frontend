import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheck, FiLock, FiDownload, FiEye } from 'react-icons/fi';
import { useWebinarAuth } from '../../../contexts/WebinarAuthContext';
import {
  formatCertificateDate,
  loadCertificateImage,
  drawCertificateToCanvas,
  downloadCertificatePng,
  downloadCertificatePdf,
} from '../utils/certificateWebinar';
import { getOrCreateCertificateForUser, createCertificateRecord, migrateCertificateToShortId, recordCertificateDownload } from '../../../utils/api';

function isLegacyCertificateId(id) {
  return !id || typeof id !== 'string' || !String(id).trim().toUpperCase().startsWith('GX');
}

function generateShortCertificateId() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  return 'GX' + hex;
}

const CARD_BASE = 'rounded-2xl bg-white shadow-sm overflow-hidden p-5 transition-all duration-200';

const FINAL_ASSESSMENT_ID = 'a5';

export default function CertificateUnlockCard({
  completedPercent = 0,
  totalSessions = 0,
  completedSessions = 0,
  completedSessionIds = [],
}) {
  const { user: authUser, token: webinarToken } = useWebinarAuth();
  const navigate = useNavigate();
  const displayName = authUser?.name || 'Trainee';
  const [downloading, setDownloading] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [userCertificateId, setUserCertificateId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [certDataUrl, setCertDataUrl] = useState(null);
  const [certLoading, setCertLoading] = useState(true);

  const unlocked = Array.isArray(completedSessionIds) && completedSessionIds.includes(FINAL_ASSESSMENT_ID);
  const remaining = Math.max(0, totalSessions - completedSessions);
  const blurPx = Math.max(0, 20 * (1 - completedPercent / 100));

  const dateStr = formatCertificateDate();

  const certCookieName = authUser?.phone
    ? `gx_cert_id_${String(authUser.phone).replace(/\D/g, '').slice(-10)}`
    : null;

  const getCertCookie = (name) => {
    if (!name) return null;
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  };

  const setCertCookie = (name, value) => {
    if (!name) return;
    const maxAge = 60 * 60 * 24 * 365; // 1 year
    document.cookie = `${name}=${encodeURIComponent(value)};max-age=${maxAge};path=/;SameSite=Lax`;
  };

  const clearCertCookie = (name) => {
    if (!name) return;
    document.cookie = `${name}=; Max-Age=0; path=/`;
  };

  // Generate certificate preview image once (name + date; cert ID optional)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const img = await loadCertificateImage();
        if (cancelled) return;
        const certId = userCertificateId || '';
        const canvas = await drawCertificateToCanvas(img, displayName, dateStr, certId);
        if (cancelled) return;
        setCertDataUrl(canvas.toDataURL('image/png'));
      } catch (e) {
        if (!cancelled) console.warn('Certificate preview failed', e);
      } finally {
        if (!cancelled) setCertLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [displayName, dateStr, userCertificateId]);

  useEffect(() => {
    if (!unlocked) return;
    let cancelled = false;
    (async () => {
      try {
        if (certCookieName) {
          const stored = getCertCookie(certCookieName);
          if (stored) {
            let idToUse = stored;
            if (isLegacyCertificateId(stored) && authUser?.phone) {
              try {
                const migrateRes = await migrateCertificateToShortId(authUser.phone);
                const migPayload = migrateRes.data?.data ?? migrateRes.data;
                if (migrateRes?.success && migPayload?.certificateId) {
                  idToUse = migPayload.certificateId;
                  setCertCookie(certCookieName, idToUse);
                }
              } catch (_) {}
            }
            try {
              const result = await createCertificateRecord({ certificateId: idToUse, fullName: displayName, dateIssued: dateStr });
              if (result?.success && !cancelled) {
                setUserCertificateId(idToUse);
                return;
              }
            } catch (_) {}
            clearCertCookie(certCookieName);
          }
        }
        if (authUser?.phone) {
          const result = await getOrCreateCertificateForUser({
            fullName: displayName,
            dateIssued: dateStr,
            mobileNumber: authUser.phone,
          });
          if (cancelled) return;
          const payload = result.data?.data ?? result.data;
          if (result.success && payload?.certificateId) {
            let idToUse = payload.certificateId;
            if (isLegacyCertificateId(idToUse)) {
              try {
                const migrateRes = await migrateCertificateToShortId(authUser.phone);
                const migPayload = migrateRes.data?.data ?? migrateRes.data;
                if (migrateRes?.success && migPayload?.certificateId) idToUse = migPayload.certificateId;
              } catch (_) {}
            }
            setCertCookie(certCookieName, idToUse);
            setUserCertificateId(idToUse);
            return;
          }
        }
        const certificateId = generateShortCertificateId();
        const createResult = await createCertificateRecord({ certificateId, fullName: displayName, dateIssued: dateStr });
        if (createResult?.success && !cancelled) {
          setCertCookie(certCookieName, certificateId);
          setUserCertificateId(certificateId);
        }
      } catch (e) {
        if (!cancelled) console.warn('Certificate setup failed', e);
      }
    })();
    return () => { cancelled = true; };
  }, [unlocked, authUser?.phone, displayName, dateStr, certCookieName]);

  const getOrEnsureCertificateId = async () => {
    if (userCertificateId) return userCertificateId;
    if (certCookieName) {
      const stored = getCertCookie(certCookieName);
      if (stored) {
        let idToUse = stored;
        if (isLegacyCertificateId(stored) && authUser?.phone) {
          try {
            const migrateRes = await migrateCertificateToShortId(authUser.phone);
            const migPayload = migrateRes.data?.data ?? migrateRes.data;
            if (migrateRes?.success && migPayload?.certificateId) {
              idToUse = migPayload.certificateId;
              setCertCookie(certCookieName, idToUse);
            }
          } catch (_) {}
        }
        try {
          const result = await createCertificateRecord({ certificateId: idToUse, fullName: displayName, dateIssued: dateStr });
          if (result?.success) {
            setUserCertificateId(idToUse);
            return idToUse;
          }
        } catch (_) {}
        clearCertCookie(certCookieName);
      }
    }
    if (authUser?.phone) {
      try {
        const result = await getOrCreateCertificateForUser({ fullName: displayName, dateIssued: dateStr, mobileNumber: authUser.phone });
        const payload = result.data?.data ?? result.data;
        if (result.success && payload?.certificateId) {
          let idToUse = payload.certificateId;
          if (isLegacyCertificateId(idToUse)) {
            try {
              const migrateRes = await migrateCertificateToShortId(authUser.phone);
              const migPayload = migrateRes.data?.data ?? migrateRes.data;
              if (migrateRes?.success && migPayload?.certificateId) idToUse = migPayload.certificateId;
            } catch (_) {}
          }
          setCertCookie(certCookieName, idToUse);
          setUserCertificateId(idToUse);
          return idToUse;
        }
      } catch (_) {}
    }
    const certificateId = generateShortCertificateId();
    const createResult = await createCertificateRecord({ certificateId, fullName: displayName, dateIssued: dateStr });
    if (!createResult?.success) {
      throw new Error(createResult?.message || 'Could not create certificate');
    }
    setCertCookie(certCookieName, certificateId);
    setUserCertificateId(certificateId);
    return certificateId;
  };

  const handleDownloadPng = async () => {
    setDownloading('png');
    setActionError('');
    try {
      const certificateId = await getOrEnsureCertificateId();
      await downloadCertificatePng(displayName, dateStr, certificateId);
      if (webinarToken) recordCertificateDownload(webinarToken).catch(() => {});
    } catch (e) {
      console.error(e);
      setActionError(e?.message || 'Unable to download certificate PNG. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading('pdf');
    setActionError('');
    try {
      const certificateId = await getOrEnsureCertificateId();
      await downloadCertificatePdf(displayName, dateStr, certificateId);
      if (webinarToken) recordCertificateDownload(webinarToken).catch(() => {});
    } catch (e) {
      console.error(e);
      setActionError(e?.message || 'Unable to download certificate PDF. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    setActionError('');
    try {
      const certificateId = await getOrEnsureCertificateId();
      navigate(`/certificate/${certificateId}`, {
        state: {
          certificate: {
            certificateId,
            fullName: displayName,
            dateIssued: dateStr,
          },
        },
      });
    } catch (e) {
      console.error(e);
      setActionError(e?.message || 'Unable to open certificate preview. Please try again.');
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className={`${CARD_BASE} border ${completedPercent >= 100 ? 'border-green-200 bg-green-50/30' : 'border-gray-200 hover:shadow-md'}`}>
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Certificate progress
        </h3>
        <span className="tabular-nums text-sm font-semibold text-gray-900">{completedPercent}%</span>
      </header>

      {/* Certificate preview — aspect 842/596, blur by progress. Single stable child to avoid removeChild issues. */}
      <div
        className="relative w-full overflow-hidden rounded-xl bg-gray-100"
        style={{ aspectRatio: '842/596' }}
      >
        <div className="absolute inset-0">
          {certLoading && (
            <div className="absolute inset-0 animate-pulse bg-gray-200" aria-hidden />
          )}
          {!certLoading && certDataUrl && (
            <img
              src={certDataUrl}
              alt="Certificate preview"
              className="h-full w-full object-cover"
              style={{
                filter: `blur(${blurPx}px)`,
                transition: 'filter 0.6s ease-in-out',
                transform: 'scale(1.04)',
              }}
            />
          )}
          {!certLoading && !certDataUrl && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
              Preview unavailable
            </div>
          )}
        </div>
        {/* Lock overlay: always in DOM, visibility toggled to avoid removeChild during reconciliation */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center bg-black/30 transition-opacity duration-200 ${
            completedPercent < 100 || !unlocked ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden={completedPercent >= 100 && unlocked}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm">
            <FiLock className="h-5 w-5 text-gray-600" aria-hidden />
          </span>
          <p className="mt-2 text-center text-sm font-medium text-white drop-shadow-sm">
            {!unlocked
              ? 'Complete Assessment 5 to unlock'
              : `${remaining} session${remaining !== 1 ? 's' : ''} remaining`}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-gray-600 font-medium">Progress</span>
        <span className="font-semibold tabular-nums text-gray-900">{completedPercent}%</span>
      </div>
      <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-primary-navy transition-all duration-500 ease-in-out"
          style={{ width: `${completedPercent}%` }}
        />
      </div>

      {completedPercent >= 100 && unlocked ? (
        <div key="cert-unlocked-actions" className="mt-4 space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-green-200/80 bg-green-50 p-4 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
              <FiCheck className="h-5 w-5 text-green-700" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight text-green-800">Certificate ready</p>
              <p className="mt-0.5 text-xs leading-tight text-green-700">You have completed all sessions.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={!!downloading}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-primary-navy px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-navy/90 disabled:opacity-60"
            >
              <FiDownload className="h-4 w-4" aria-hidden />
              {downloading === 'png' ? 'Preparing…' : 'Download PNG'}
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={!!downloading}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:opacity-60"
            >
              <FiDownload className="h-4 w-4" aria-hidden />
              {downloading === 'pdf' ? 'Preparing…' : 'Download PDF'}
            </button>
            <button
              type="button"
              onClick={handlePreview}
              disabled={!!previewLoading}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-primary-navy/20 bg-primary-navy/10 px-4 py-2.5 text-sm font-medium text-primary-navy transition-colors hover:bg-primary-navy/20 disabled:opacity-60"
            >
              <FiEye className="h-4 w-4" aria-hidden />
              {previewLoading ? 'Loading…' : 'Preview'}
            </button>
          </div>
          {actionError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {actionError}
            </div>
          )}
        </div>
      ) : (
        <div key="cert-locked-actions" className="mt-4 space-y-3">
          <p className="text-sm text-gray-600">
            {unlocked
              ? `Complete ${remaining} more session${remaining !== 1 ? 's' : ''} to unlock.`
              : 'Complete Assessment 5 (final assessment) to unlock your certificate.'}
          </p>
          <Link
            to="/webinar/progress"
            className="inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary-navy px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-navy/90"
          >
            {unlocked ? 'View progress to unlock' : 'Go to training'}
          </Link>
        </div>
      )}
    </div>
  );
}
