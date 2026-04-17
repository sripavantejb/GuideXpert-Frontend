import { useMemo, useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiDownload,
  FiImage,
  FiLoader,
  FiLock,
} from 'react-icons/fi';
import { trackPosterDownloadBeacon, verifyPosterActivation } from '../utils/api';
import { usePosterByRoute } from '../components/Posters/usePosterByRoute';
import PosterSvgLayer from '../components/Posters/PosterSvgLayer';
import PosterTextOverlays from '../components/Posters/PosterTextOverlays';
import { capturePosterToCanvas } from '../utils/posterExportCapture';
import {
  getDesignFrameSize,
  getPreviewFrameSize,
  POSTER_PREVIEW_MIN_SLOT_PX,
} from '../utils/posterExportDimensions';

/** Public `/p/` preview: narrower than admin max so the card stays balanced beside the form. */
const POSTER_PUBLIC_PREVIEW_MAX_SLOT_PX = 520;
/** Cap on-screen preview height (portrait templates otherwise become a very tall preview). */
const POSTER_PUBLIC_MAX_PREVIEW_HEIGHT_PX = 480;

function normalizeMobileInput(raw) {
  const d = String(raw ?? '').replace(/\D/g, '').slice(-10);
  return d.length === 10 ? d : '';
}

function formatMobileDisplay(digits10) {
  if (!digits10 || digits10.length !== 10) return String(digits10 ?? '');
  return `${digits10.slice(0, 5)} ${digits10.slice(5)}`;
}

/** Placeholder copy for locked preview (no real PII). */
const LOCKED_PREVIEW_VARIABLES = {
  name: 'Sample name',
  mobile: '••••• ••••••',
};

async function waitNextPaintFrames(count = 2) {
  for (let i = 0; i < count; i += 1) {
    await new Promise((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }
}

async function waitForFontsReady() {
  try {
    const ready = typeof document !== 'undefined' ? document.fonts?.ready : null;
    if (ready && typeof ready.then === 'function') {
      await ready;
    }
  } catch {
    /* ignore */
  }
}

function safeFileSlug(name) {
  const s = String(name || 'poster')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\-_.]/g, '')
    .slice(0, 48);
  return s || 'poster';
}

export default function PosterPublicPage() {
  const location = useLocation();
  const pathname = location.pathname;
  const routeOk = pathname.startsWith('/p/') && pathname.length > 3;

  const { poster, loading, error } = usePosterByRoute(routeOk ? pathname : '', routeOk);

  const showPosterCanvas = Boolean(!loading && poster?.svgTemplate);

  const [mobileInput, setMobileInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [exportError, setExportError] = useState('');
  const [session, setSession] = useState(null);

  const exportRef = useRef(null);
  const posterColumnMeasureRef = useRef(null);
  const [previewSlotWidthPx, setPreviewSlotWidthPx] = useState(POSTER_PUBLIC_PREVIEW_MAX_SLOT_PX);
  const [exporting, setExporting] = useState(false);

  const designFrame = useMemo(() => getDesignFrameSize(poster?.svgTemplate), [poster?.svgTemplate]);

  useLayoutEffect(() => {
    if (!showPosterCanvas) return;
    const el = posterColumnMeasureRef.current;
    if (!el) return;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w <= 0) return;
      const next = Math.floor(
        Math.min(POSTER_PUBLIC_PREVIEW_MAX_SLOT_PX, Math.max(POSTER_PREVIEW_MIN_SLOT_PX, w))
      );
      setPreviewSlotWidthPx(next);
    };
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [showPosterCanvas]);

  const previewFrame = useMemo(() => {
    const base = getPreviewFrameSize(poster?.svgTemplate, previewSlotWidthPx);
    if (!poster?.svgTemplate) return base;
    if (base.previewHeight <= POSTER_PUBLIC_MAX_PREVIEW_HEIGHT_PX) return base;
    const scale = POSTER_PUBLIC_MAX_PREVIEW_HEIGHT_PX / base.designHeight;
    return {
      ...base,
      previewWidth: Math.round(base.designWidth * scale),
      previewHeight: POSTER_PUBLIC_MAX_PREVIEW_HEIGHT_PX,
      scale,
    };
  }, [poster?.svgTemplate, previewSlotWidthPx]);

  useEffect(() => {
    if (!import.meta.env.DEV || !poster?.svgTemplate || loading) return;
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        const el = exportRef.current;
        if (!(el instanceof HTMLElement)) return;
        const { offsetWidth, offsetHeight } = el;
        const rect = el.getBoundingClientRect();
        // eslint-disable-next-line no-console -- dev poster geometry QA
        console.debug('[poster public] exportRef geometry', {
          offsetWidth,
          offsetHeight,
          expectedHeight: designFrame.height,
          heightMatch: offsetHeight === designFrame.height,
          rect: { width: rect.width, height: rect.height },
        });
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [poster?.svgTemplate, designFrame.height, loading, session]);

  const unlockedVariables = useMemo(
    () => ({
      name: session?.name != null ? String(session.name) : '',
      mobile:
        session?.mobile != null
          ? formatMobileDisplay(String(session.mobile).replace(/\D/g, '').slice(-10))
          : '',
    }),
    [session]
  );

  const displayVariables = session ? unlockedVariables : LOCKED_PREVIEW_VARIABLES;

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifyError('');
    const m = normalizeMobileInput(mobileInput);
    if (!m) {
      setVerifyError('Enter a valid 10-digit mobile number.');
      return;
    }
    setVerifying(true);
    try {
      const res = await verifyPosterActivation(pathname, m);
      if (!res.success) {
        setVerifyError(res.message || 'Verification failed.');
        return;
      }
      const body = res.data;
      if (!body || body.success !== true) {
        setVerifyError((body && body.message) || 'No activation record found for this number.');
        return;
      }
      setSession({
        name: body.name != null ? String(body.name) : '',
        mobile: body.mobile != null ? String(body.mobile) : m,
      });
    } finally {
      setVerifying(false);
    }
  };

  const triggerBlobDownload = useCallback((blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  const runExportPng = useCallback(async () => {
    if (!session) return;
    const node = exportRef.current;
    if (!(node instanceof HTMLElement)) return;
    setExporting(true);
    setExportError('');
    try {
      await waitNextPaintFrames(2);
      await waitForFontsReady();
      const canvas = await capturePosterToCanvas(node, {
        width: designFrame.width,
        height: designFrame.height,
      });
      const baseName = safeFileSlug(poster?.name);
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (!b) reject(new Error('Could not create image blob'));
            else resolve(b);
          },
          'image/png',
          1
        );
      });
      triggerBlobDownload(blob, `${baseName}.png`);
      trackPosterDownloadBeacon({
        posterKey: 'automated',
        format: 'png',
        displayName: session.name,
        mobileNumber: String(session.mobile).replace(/\D/g, '').slice(-10),
        routeContext: 'public',
        posterRoute: poster?.route || pathname,
      });
    } catch (err) {
      console.error(err);
      setExportError('PNG download failed. Try another browser or disable extensions that block downloads.');
    } finally {
      setExporting(false);
    }
  }, [designFrame.height, designFrame.width, pathname, poster?.name, poster?.route, session, triggerBlobDownload]);

  const runExportPdf = useCallback(async () => {
    if (!session) return;
    const node = exportRef.current;
    if (!(node instanceof HTMLElement)) return;
    setExporting(true);
    setExportError('');
    try {
      await waitNextPaintFrames(2);
      await waitForFontsReady();
      const { jsPDF } = await import('jspdf');
      const canvas = await capturePosterToCanvas(node, {
        width: designFrame.width,
        height: designFrame.height,
      });
      let w = canvas.width;
      let h = canvas.height;
      const maxPx = 14400;
      if (w > maxPx || h > maxPx) {
        const s = Math.min(maxPx / w, maxPx / h, 1);
        w = Math.floor(w * s);
        h = Math.floor(h * s);
      }
      const pdf = new jsPDF({
        orientation: w > h ? 'landscape' : 'portrait',
        unit: 'px',
        format: [w, h],
        compress: true,
      });
      const imgData = canvas.toDataURL('image/png', 1);
      pdf.addImage(imgData, 'PNG', 0, 0, w, h);
      const baseName = safeFileSlug(poster?.name);
      pdf.save(`${baseName}.pdf`);
      trackPosterDownloadBeacon({
        posterKey: 'automated',
        format: 'pdf',
        displayName: session.name,
        mobileNumber: String(session.mobile).replace(/\D/g, '').slice(-10),
        routeContext: 'public',
        posterRoute: poster?.route || pathname,
      });
    } catch (err) {
      console.error(err);
      setExportError('PDF download failed. Try Chrome or update your browser.');
    } finally {
      setExporting(false);
    }
  }, [designFrame.height, designFrame.width, pathname, poster?.name, poster?.route, session]);

  if (!routeOk) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16 text-center">
        <p className="text-sm text-slate-600">Open this page from a link that starts with /p/</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-[420px] flex-col px-4 py-10 sm:max-w-[440px] sm:py-14 lg:max-w-5xl lg:px-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-100 px-5 py-6 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-primary-navy">
              <FiLock className="h-5 w-5" aria-hidden />
            </div>
            <h1 className="mt-4 text-lg font-bold leading-snug tracking-tight text-slate-900 sm:text-xl">
              {poster?.name || 'Your poster'}
            </h1>
            <p className="mx-auto mt-2 text-sm leading-relaxed text-slate-600">
              Enter the mobile number from your activation record to unlock your poster and download a print-ready file.
            </p>
          </header>

          <div className="px-5 pb-6 pt-6 sm:px-6 sm:pb-8">
            {error ? (
              <div
                className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm text-amber-950"
                role="alert"
              >
                <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                <p>{error}</p>
              </div>
            ) : null}

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-slate-500">
                <FiLoader className="h-10 w-10 animate-spin text-primary-navy/60" aria-hidden />
                <p className="text-sm font-medium">Loading your poster…</p>
              </div>
            ) : null}

            {!loading && !poster?.svgTemplate ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-10 text-center">
                <p className="font-semibold text-slate-800">Poster not available</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  This link is not published yet or does not exist. Contact your coordinator for an updated link.
                </p>
              </div>
            ) : null}

            {showPosterCanvas ? (
              <div className="grid w-full min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,520px)_minmax(260px,20rem)] lg:items-start lg:gap-8">
                <div
                  ref={posterColumnMeasureRef}
                  className="mx-auto flex w-full min-w-0 justify-center lg:mx-0 lg:justify-self-start"
                  style={{ maxWidth: POSTER_PUBLIC_PREVIEW_MAX_SLOT_PX }}
                >
                  <div
                    className="relative shrink-0 overflow-hidden bg-white"
                    style={{
                      width: previewFrame.previewWidth,
                      height: previewFrame.previewHeight,
                      borderRadius: 10,
                      boxShadow: '0 2px 12px rgba(15, 23, 42, 0.1)',
                    }}
                  >
                    <div
                      ref={exportRef}
                      className="relative overflow-hidden bg-white"
                      style={{
                        width: designFrame.width,
                        height: designFrame.height,
                        transform: `scale(${previewFrame.scale})`,
                        transformOrigin: 'top left',
                        boxSizing: 'border-box',
                        WebkitTextSizeAdjust: '100%',
                        textSizeAdjust: '100%',
                      }}
                    >
                      <div
                        className={`absolute inset-0 h-full w-full transition-[filter] duration-500 ease-out ${
                          session ? 'blur-none' : 'blur-sm'
                        }`}
                      >
                        <PosterSvgLayer
                          svgTemplate={poster.svgTemplate}
                          className="absolute inset-0 h-full w-full overflow-hidden [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
                        />
                        <PosterTextOverlays
                          nameField={poster.nameField}
                          mobileField={poster.mobileField}
                          variables={displayVariables}
                          interactive={false}
                        />
                      </div>
                    </div>

                    {!session ? (
                      <div
                        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end rounded-[10px] bg-gradient-to-t from-slate-950/88 via-slate-950/35 to-transparent px-3 pb-6 pt-20 text-center"
                        aria-hidden
                      >
                        <FiLock className="mb-1.5 h-8 w-8 text-white/95 drop-shadow-md" aria-hidden />
                        <p className="text-sm font-semibold text-white drop-shadow-sm">Preview locked</p>
                        <p className="mt-1 text-xs leading-relaxed text-white/88 lg:hidden">
                          Enter your registered mobile number below to unlock.
                        </p>
                        <p className="mt-1 hidden text-xs leading-relaxed text-white/88 lg:block">
                          Enter your registered mobile number on the right to unlock.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="w-full max-w-sm justify-self-center lg:justify-self-stretch lg:border-l lg:border-slate-100 lg:pl-8">
                {!session ? (
                  <form onSubmit={handleVerify} className="space-y-4" aria-busy={verifying}>
                    <label className="block text-left">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Mobile number
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={mobileInput}
                        onChange={(e) => setMobileInput(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 outline-none transition focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/20"
                        placeholder="10-digit number"
                        maxLength={14}
                        aria-invalid={Boolean(verifyError)}
                        aria-describedby={verifyError ? 'verify-err' : undefined}
                      />
                    </label>
                    {verifyError ? (
                      <div
                        id="verify-err"
                        className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
                        role="alert"
                      >
                        <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        <span>{verifyError}</span>
                      </div>
                    ) : null}
                    <button
                      type="submit"
                      disabled={verifying}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-navy py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#002952] disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      {verifying ? (
                        <>
                          <FiLoader className="h-4 w-4 animate-spin" aria-hidden />
                          Verifying…
                        </>
                      ) : (
                        <>
                          <FiLock className="h-4 w-4 opacity-90" aria-hidden />
                          Verify and unlock
                        </>
                      )}
                    </button>
                  </form>
                ) : null}

                {session ? (
                  <div className="space-y-5">
                    <div
                      className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-3 text-left text-sm text-emerald-950"
                      role="status"
                    >
                      <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                      <div>
                        <p className="font-semibold">Unlocked</p>
                        <p className="mt-0.5 text-emerald-900/90">
                          Your details appear on the poster. Choose a format to download.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => void runExportPng()}
                        disabled={exporting}
                        aria-busy={exporting}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary-navy bg-primary-navy px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#002952] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FiImage className="h-4 w-4" aria-hidden />
                        {exporting ? 'Preparing…' : 'Download PNG'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void runExportPdf()}
                        disabled={exporting}
                        aria-busy={exporting}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FiDownload className="h-4 w-4" aria-hidden />
                        {exporting ? 'Preparing…' : 'Download PDF'}
                      </button>
                    </div>

                    {exportError ? (
                      <div
                        className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
                        role="alert"
                      >
                        <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        <span>{exportError}</span>
                      </div>
                    ) : null}

                    <p className="text-center text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{unlockedVariables.name}</span>
                      <span className="mx-2 text-slate-300">·</span>
                      <span className="tabular-nums text-slate-600">{unlockedVariables.mobile}</span>
                    </p>
                  </div>
                ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-500">
          Your mobile is checked against our activation records. Downloads may be logged for support purposes.
        </p>
      </div>
    </div>
  );
}
