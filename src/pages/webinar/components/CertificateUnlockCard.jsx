import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheck, FiLock, FiDownload, FiEye } from 'react-icons/fi';
import { useWebinarAuth } from '../../../contexts/WebinarAuthContext';
import { formatCertificateDate, downloadCertificatePng, downloadCertificatePdf } from '../utils/certificateWebinar';
import { getOrCreateCertificateForUser, createCertificateRecord } from '../../../utils/api';

const CARD_BASE = 'rounded-xl bg-white shadow-card overflow-hidden p-3 transition-all duration-300';
const CARD_LOCKED = `${CARD_BASE} border border-gray-200 hover:shadow-card-hover hover:-translate-y-0.5`;
const CARD_UNLOCKED = `${CARD_BASE} border-2 border-green-200 ring-2 ring-green-100`;

export default function CertificateUnlockCard({
  completedPercent = 0,
  totalSessions = 0,
  completedSessions = 0,
}) {
  const { user: authUser } = useWebinarAuth();
  const navigate = useNavigate();
  const displayName = authUser?.name || 'Trainee';
  const [downloading, setDownloading] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [userCertificateId, setUserCertificateId] = useState(null);

  const unlocked = completedPercent >= 100;
  const remaining = Math.max(0, totalSessions - completedSessions);

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

  useEffect(() => {
    if (!unlocked) return;
    let cancelled = false;
    (async () => {
      try {
        // 1. Check cookie first
        if (certCookieName) {
          const stored = getCertCookie(certCookieName);
          if (stored) {
            if (!cancelled) setUserCertificateId(stored);
            return;
          }
        }
        // 2. Try backend mobile API
        if (authUser?.phone) {
          const result = await getOrCreateCertificateForUser({
            fullName: displayName,
            dateIssued: dateStr,
            mobileNumber: authUser.phone,
          });
          if (cancelled) return;
          const payload = result.data?.data ?? result.data;
          if (result.success && payload?.certificateId) {
            setCertCookie(certCookieName, payload.certificateId);
            setUserCertificateId(payload.certificateId);
            return;
          }
        }
        // 3. Generate once, save to DB and cookie
        const certificateId = crypto.randomUUID();
        await createCertificateRecord({ certificateId, fullName: displayName, dateIssued: dateStr });
        if (!cancelled) {
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
    // 1. Already in state
    if (userCertificateId) return userCertificateId;
    // 2. Check cookie
    if (certCookieName) {
      const stored = getCertCookie(certCookieName);
      if (stored) {
        setUserCertificateId(stored);
        try { await createCertificateRecord({ certificateId: stored, fullName: displayName, dateIssued: dateStr }); } catch (_) {}
        return stored;
      }
    }
    // 3. Try backend mobile API
    if (authUser?.phone) {
      try {
        const result = await getOrCreateCertificateForUser({ fullName: displayName, dateIssued: dateStr, mobileNumber: authUser.phone });
        const payload = result.data?.data ?? result.data;
        if (result.success && payload?.certificateId) {
          setCertCookie(certCookieName, payload.certificateId);
          setUserCertificateId(payload.certificateId);
          return payload.certificateId;
        }
      } catch (_) {}
    }
    // 4. Generate once, save to DB and cookie
    const certificateId = crypto.randomUUID();
    await createCertificateRecord({ certificateId, fullName: displayName, dateIssued: dateStr });
    setCertCookie(certCookieName, certificateId);
    setUserCertificateId(certificateId);
    return certificateId;
  };

  const handleDownloadPng = async () => {
    setDownloading('png');
    try {
      const certificateId = await getOrEnsureCertificateId();
      await downloadCertificatePng(displayName, dateStr, certificateId);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading('pdf');
    try {
      const certificateId = await getOrEnsureCertificateId();
      await downloadCertificatePdf(displayName, dateStr, certificateId);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(null);
    }
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    try {
      const certificateId = await getOrEnsureCertificateId();
      navigate(`/certificate/${certificateId}`);
    } catch (e) {
      console.error(e);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className={unlocked ? CARD_UNLOCKED : CARD_LOCKED}>
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
              onClick={handleDownloadPng}
              disabled={!!downloading}
              className="inline-flex items-center justify-center gap-2 min-h-[40px] px-3 py-2 rounded-xl bg-primary-navy text-white text-xs font-medium hover:bg-primary-navy/90 transition-colors w-full disabled:opacity-60"
            >
              <FiDownload className="w-4 h-4" aria-hidden />
              {downloading === 'png' ? 'Preparing…' : 'Download PNG'}
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={!!downloading}
              className="inline-flex items-center justify-center gap-2 min-h-[40px] px-3 py-2 rounded-xl border-2 border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors w-full disabled:opacity-60"
            >
              <FiDownload className="w-4 h-4" aria-hidden />
              {downloading === 'pdf' ? 'Preparing…' : 'Download PDF'}
            </button>
            <button
              type="button"
              onClick={handlePreview}
              disabled={!!previewLoading}
              className="inline-flex items-center justify-center gap-2 min-h-[40px] px-3 py-2 rounded-xl bg-primary-navy/10 text-primary-navy text-xs font-medium hover:bg-primary-navy/20 transition-colors w-full border border-green-200 disabled:opacity-60"
            >
              <FiEye className="w-3.5 h-3.5" aria-hidden />
              {previewLoading ? 'Loading…' : 'Preview'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
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
          <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 min-w-0">
            <span className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0 flex-shrink-0">
              <FiLock className="w-4 h-4 text-gray-500" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-700">Certificate of Completion</p>
              <p className="text-[10px] text-gray-500">Unlock after completing Day 3</p>
            </div>
          </div>
          <Link
            to="/webinar/progress"
            className="inline-flex items-center justify-center gap-2 w-full min-h-[40px] px-3 py-2.5 rounded-xl bg-primary-navy text-white text-sm font-medium hover:bg-primary-navy/90 transition-colors"
          >
            View progress to unlock
          </Link>
        </div>
      )}
    </div>
  );
}
