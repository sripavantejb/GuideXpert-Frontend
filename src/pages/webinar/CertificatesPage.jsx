import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWebinar } from './context/WebinarContext';
import { useWebinarAuth } from '../../contexts/WebinarAuthContext';
import { getSessionsByDay } from './data/mockWebinarData';
import {
  formatCertificateDate,
  downloadCertificatePng,
  downloadCertificatePdf,
} from './utils/certificateWebinar';
import { getOrCreateCertificateForUser, createCertificateRecord, migrateCertificateToShortId } from '../../utils/api';
import { FiDownload, FiLock, FiAward, FiEye } from 'react-icons/fi';

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
  const { completedSessions } = useWebinar();
  const { user: authUser } = useWebinarAuth();
  const displayName = authUser?.name || 'Trainee';

  const day3Complete = useMemo(() => {
    const day3Ids = getSessionsByDay(3).map((s) => s.id);
    return day3Ids.length > 0 && day3Ids.every((id) => completedSessions.includes(id));
  }, [completedSessions]);

  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [userCertificateId, setUserCertificateId] = useState(null);

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
    } finally {
      setPreviewLoading(false);
    }
  };

  if (!day3Complete) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl">
        <div className="rounded-2xl bg-gradient-to-br from-primary-navy/5 to-transparent px-4 py-3 mb-6">
          <h1 className="text-xl font-semibold text-gray-800">My Certificates</h1>
          <p className="text-sm text-gray-500 mt-0.5">Unlock your certificate after completing all sessions.</p>
        </div>
        <div className="mt-6 rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden p-8 flex flex-col items-center text-center">
          <span className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
            <FiLock className="w-8 h-8" aria-hidden />
          </span>
          <p className="text-gray-700 font-medium">Certificate locked</p>
          <p className="text-sm text-gray-500 mt-2">
            Complete all Day 3 sessions to unlock your Certified GuideXpert Career Counsellor certificate.
          </p>
          <Link
            to="/webinar/progress"
            className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary-navy text-white text-sm font-medium hover:bg-primary-navy/90 transition-colors"
          >
            View progress
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      <div className="rounded-2xl bg-gradient-to-br from-primary-navy/5 to-transparent px-4 py-4 mb-6 flex items-center gap-3">
        <span className="w-12 h-12 rounded-xl bg-primary-navy/10 flex items-center justify-center text-primary-navy flex-shrink-0">
          <FiAward className="w-6 h-6" aria-hidden />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-gray-800">My Certificates</h1>
          <p className="text-sm text-gray-500 mt-0.5">Download your Certified GuideXpert Career Counsellor certificate in PNG or PDF.</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden">
        <div className="p-5 border-b border-gray-100 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={!!downloading}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-navy text-white text-sm font-medium hover:bg-primary-navy/90 disabled:opacity-60 transition-colors shadow-sm"
            >
              <FiDownload className="w-4 h-4" aria-hidden />
              {downloading === 'png' ? 'Preparing…' : 'Download PNG'}
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={!!downloading}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 disabled:opacity-60 transition-colors"
            >
              <FiDownload className="w-4 h-4" aria-hidden />
              {downloading === 'pdf' ? 'Preparing…' : 'Download PDF'}
            </button>
            <button
              type="button"
              onClick={handlePreview}
              disabled={!!previewLoading}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-navy/10 text-primary-navy text-sm font-medium hover:bg-primary-navy/20 transition-colors border border-primary-navy/20 disabled:opacity-60"
            >
              <FiEye className="w-4 h-4" aria-hidden />
              {previewLoading ? 'Loading…' : 'Preview'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
