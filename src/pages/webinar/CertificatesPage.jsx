import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWebinarAuth } from '../../contexts/WebinarAuthContext';
import {
  formatCertificateDate,
  downloadCertificatePng,
  downloadCertificatePdf,
  getCertificatePngDataUrl,
} from './utils/certificateWebinar';
import { getOrCreateCertificateForUser, createCertificateRecord, migrateCertificateToShortId } from '../../utils/api';
import { FiDownload, FiLock, FiAward, FiExternalLink, FiCheckCircle, FiUser, FiCalendar, FiHash } from 'react-icons/fi';

function isLegacyCertificateId(id) {
  return !id || typeof id !== 'string' || !String(id).trim().toUpperCase().startsWith('GX');
}

function generateShortCertificateId() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  return 'GX' + hex;
}

export default function CertificatesPage() {
  const { user: authUser } = useWebinarAuth();
  const displayName = authUser?.name || 'Trainee';

  // Unlock all for now (no completion gate)
  const day3Complete = true;

  const [downloading, setDownloading] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [previewCertificateId, setPreviewCertificateId] = useState(null);
  const [userCertificateId, setUserCertificateId] = useState(null);
  const [actionError, setActionError] = useState('');

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

  useEffect(() => {
    if (!day3Complete) return;
    let cancelled = false;
    (async () => {
      try {
        // 1. Check cookie first — only set state if upsert succeeds; migrate legacy UUID to GX
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
        // 2. Try backend mobile-based API; migrate legacy UUID to GX if needed
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
        // 3. Generate once, save to DB and cookie (only if create succeeds)
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
  }, [day3Complete, authUser?.phone, displayName, dateStr, certCookieName]);

  // Load certificate preview image when we have a certificate ID (show on screen always)
  useEffect(() => {
    if (!day3Complete || !userCertificateId || !displayName) return;
    let cancelled = false;
    setPreviewLoading(true);
    getCertificatePngDataUrl(displayName, dateStr, userCertificateId)
      .then((dataUrl) => {
        if (!cancelled) {
          setPreviewImageUrl(dataUrl);
          setPreviewCertificateId(userCertificateId);
        }
      })
      .catch((e) => {
        if (!cancelled) setActionError(e?.message || 'Could not load certificate preview.');
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => { cancelled = true; };
  }, [day3Complete, userCertificateId, displayName, dateStr]);

  const getOrEnsureCertificateId = async () => {
    // 1. Already in state (only set after successful upsert/create)
    if (userCertificateId) return userCertificateId;
    // 2. Check cookie — only use if upsert succeeds; migrate legacy UUID to GX
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
    // 3. Try backend mobile API; migrate legacy UUID to GX if needed
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
    // 4. Generate once, save to DB and cookie (only use ID if create succeeds)
    const certificateId = generateShortCertificateId();
    const createResult = await createCertificateRecord({ certificateId, fullName: displayName, dateIssued: dateStr });
    if (!createResult?.success) {
      throw new Error(createResult?.message || 'Could not create certificate');
    }
    setCertCookie(certCookieName, certificateId);
    setUserCertificateId(certificateId);
    return certificateId;
  };

  const handlePreviewDownloadPng = async () => {
    if (!previewCertificateId) return;
    setDownloading('png');
    try {
      await downloadCertificatePng(displayName, dateStr, previewCertificateId);
    } catch (e) {
      console.error(e);
      setActionError(e?.message || 'Unable to download certificate PNG. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const handlePreviewDownloadPdf = async () => {
    if (!previewCertificateId) return;
    setDownloading('pdf');
    try {
      await downloadCertificatePdf(displayName, dateStr, previewCertificateId);
    } catch (e) {
      console.error(e);
      setActionError(e?.message || 'Unable to download certificate PDF. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  if (!day3Complete) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Certificates</h1>
          <p className="text-sm text-gray-500 mt-1">Unlock your certificate after completing all sessions.</p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-12 flex flex-col items-center text-center">
          <span className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-5">
            <FiLock className="w-8 h-8" aria-hidden />
          </span>
          <p className="text-base font-semibold text-gray-800">Certificate locked</p>
          <p className="text-sm text-gray-500 mt-2 max-w-xs leading-relaxed">
            Complete all sessions to unlock your Certified GuideXpert Career Counsellor certificate.
          </p>
          <Link
            to="/webinar/progress"
            className="mt-6 inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-primary-navy text-white text-sm font-medium hover:bg-primary-navy/90 transition-colors shadow-sm"
          >
            View progress
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl space-y-6">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-primary-navy/10 flex items-center justify-center text-primary-navy shrink-0">
          <FiAward className="w-5 h-5" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Certificates</h1>
          <p className="text-sm text-gray-500 mt-0.5">Certified GuideXpert Career Counsellor</p>
        </div>
      </div>

      {/* Main certificate card */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">

        {/* Verified banner */}
        <div className="flex items-center gap-3 px-5 py-3 bg-green-50 border-b border-green-100">
          <FiCheckCircle className="w-4 h-4 text-green-600 shrink-0" aria-hidden />
          <span className="text-sm font-semibold text-green-800">Verified Certificate</span>
          <span className="ml-auto text-xs text-green-600 font-medium">GuideXpert · {dateStr}</span>
        </div>

        {/* Certificate image area */}
        <div className="bg-gray-50 px-6 py-8 flex justify-center">
          {previewImageUrl ? (
            <img
              src={previewImageUrl}
              alt={`Certificate for ${displayName}`}
              className="w-full max-w-3xl rounded-xl shadow-lg border border-gray-200 object-contain"
            />
          ) : (
            <div className="w-full max-w-3xl aspect-842/596 rounded-xl bg-gray-200 animate-pulse flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
              <span className="text-sm text-gray-500 font-medium">
                {previewLoading ? 'Generating your certificate…' : 'Certificate will appear here'}
              </span>
            </div>
          )}
        </div>

        {/* Metadata row */}
        {previewImageUrl && (
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 border-t border-gray-100">
            <div className="flex items-center gap-3 px-5 py-4">
              <span className="w-8 h-8 rounded-lg bg-primary-navy/8 flex items-center justify-center shrink-0">
                <FiUser className="w-4 h-4 text-primary-navy" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Recipient</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{displayName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4">
              <span className="w-8 h-8 rounded-lg bg-primary-navy/8 flex items-center justify-center shrink-0">
                <FiCalendar className="w-4 h-4 text-primary-navy" aria-hidden />
              </span>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Date Issued</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{dateStr}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4">
              <span className="w-8 h-8 rounded-lg bg-primary-navy/8 flex items-center justify-center shrink-0">
                <FiHash className="w-4 h-4 text-primary-navy" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Certificate ID</p>
                <p className="text-sm font-mono text-gray-600 mt-0.5 truncate">{previewCertificateId}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePreviewDownloadPng}
            disabled={!!downloading || !previewCertificateId}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-navy text-white text-sm font-medium hover:bg-primary-navy/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            <FiDownload className="w-4 h-4" aria-hidden />
            {downloading === 'png' ? 'Preparing…' : 'Download PNG'}
          </button>
          <button
            type="button"
            onClick={handlePreviewDownloadPdf}
            disabled={!!downloading || !previewCertificateId}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 transition-colors"
          >
            <FiDownload className="w-4 h-4" aria-hidden />
            {downloading === 'pdf' ? 'Preparing…' : 'Download PDF'}
          </button>
          {previewCertificateId && (
            <Link
              to={`/certificate/${previewCertificateId}`}
              state={{ certificate: { certificateId: previewCertificateId, fullName: displayName, dateIssued: dateStr } }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors ml-auto"
            >
              <FiExternalLink className="w-4 h-4" aria-hidden />
              View full page
            </Link>
          )}
        </div>

        {actionError && (
          <div className="mx-5 mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
            {actionError}
          </div>
        )}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-gray-400 pb-2">
        This certificate was officially issued by GuideXpert. The Certificate ID can be used to verify authenticity.
      </p>
    </div>
  );
}
