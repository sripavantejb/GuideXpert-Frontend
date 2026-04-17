import { useMemo, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { FiAlertCircle, FiDownload, FiImage, FiLoader, FiLock } from 'react-icons/fi';
import { verifyPosterActivation } from '../utils/api';
import { usePosterByRoute } from '../components/Posters/usePosterByRoute';
import PosterSvgLayer from '../components/Posters/PosterSvgLayer';
import PosterTextOverlays from '../components/Posters/PosterTextOverlays';
import { getPosterHtml2canvasOptions } from '../utils/posterHtml2canvas';

function parseSvgAspectRatio(svg) {
  if (!svg || typeof svg !== 'string') return 3 / 4;
  const m = svg.match(/viewBox\s*=\s*["']\s*([\d.\s-]+)\s*["']/i);
  if (!m) return 3 / 4;
  const parts = m[1].trim().split(/\s+/).map(Number);
  if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) return parts[2] / parts[3];
  return 3 / 4;
}

function normalizeMobileInput(raw) {
  const d = String(raw ?? '').replace(/\D/g, '').slice(-10);
  return d.length === 10 ? d : '';
}

function formatMobileDisplay(digits10) {
  if (!digits10 || digits10.length !== 10) return String(digits10 ?? '');
  return `${digits10.slice(0, 5)} ${digits10.slice(5)}`;
}

export default function PosterPublicPage() {
  const location = useLocation();
  const pathname = location.pathname;
  const routeOk = pathname.startsWith('/p/') && pathname.length > 3;

  const { poster, loading, error } = usePosterByRoute(routeOk ? pathname : '', routeOk);

  const [mobileInput, setMobileInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [session, setSession] = useState(null);

  const exportRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const aspect = useMemo(() => (poster ? parseSvgAspectRatio(poster.svgTemplate) : 3 / 4), [poster]);

  const variables = useMemo(
    () => ({
      name: session?.name != null ? String(session.name) : '',
      mobile: session?.mobile != null ? formatMobileDisplay(String(session.mobile).replace(/\D/g, '').slice(-10)) : '',
    }),
    [session]
  );

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

  const runExportPng = useCallback(async () => {
    const node = exportRef.current;
    if (!(node instanceof HTMLElement)) return;
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(node, getPosterHtml2canvasOptions({ originalRoot: node }));
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${((poster?.name || 'poster').replace(/\s+/g, '-') || 'poster').slice(0, 48)}.png`;
      a.click();
    } catch (err) {
      console.error(err);
      setVerifyError('PNG export failed.');
    } finally {
      setExporting(false);
    }
  }, [poster?.name]);

  const runExportPdf = useCallback(async () => {
    const node = exportRef.current;
    if (!(node instanceof HTMLElement)) return;
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(node, getPosterHtml2canvasOptions({ originalRoot: node }));
      const w = canvas.width;
      const h = canvas.height;
      const pdf = new jsPDF({
        orientation: w > h ? 'landscape' : 'portrait',
        unit: 'px',
        format: [w, h],
      });
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, w, h);
      pdf.save(`${((poster?.name || 'poster').replace(/\s+/g, '-') || 'poster').slice(0, 48)}.pdf`);
    } catch (err) {
      console.error(err);
      setVerifyError('PDF export failed.');
    } finally {
      setExporting(false);
    }
  }, [poster?.name]);

  if (!routeOk) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16 text-center">
        <p className="text-sm text-slate-600">This page must be opened using a link that starts with /p/</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)]">
      <div className="mx-auto max-w-lg px-4 py-10 sm:py-14">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-navy/10 text-primary-navy">
            <FiLock className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {poster?.name || 'Poster'}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter the mobile number registered with your activation to unlock your poster and downloads.
          </p>
        </div>

        {error ? (
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p>{error}</p>
          </div>
        ) : null}

        {loading ? (
          <div className="mt-12 flex flex-col items-center justify-center gap-3 text-slate-500">
            <FiLoader className="h-8 w-8 animate-spin" aria-hidden />
            <p className="text-sm">Loading poster…</p>
          </div>
        ) : null}

        {!loading && !poster?.svgTemplate ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white/90 px-5 py-8 text-center shadow-sm">
            <p className="font-medium text-slate-800">Poster not available</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              This link is not live yet or does not exist. If you expected to see a poster here, ask your coordinator for the
              correct link.
            </p>
          </div>
        ) : null}

        {!loading && poster?.svgTemplate && !session ? (
          <form onSubmit={handleVerify} className="mt-10 space-y-4">
            <label className="block text-left">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mobile number</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={mobileInput}
                onChange={(e) => setMobileInput(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-primary-blue-400 focus:outline-none focus:ring-2 focus:ring-primary-blue-400/20"
                placeholder="10-digit mobile"
                maxLength={14}
              />
            </label>
            {verifyError ? (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{verifyError}</span>
              </div>
            ) : null}
            <button
              type="submit"
              disabled={verifying}
              className="w-full rounded-xl bg-primary-navy py-3.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {verifying ? 'Verifying…' : 'Verify and continue'}
            </button>
          </form>
        ) : null}

        {!loading && poster?.svgTemplate && session ? (
          <div className="mt-10 space-y-6">
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => void runExportPng()}
                disabled={exporting}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
              >
                <FiImage className="h-4 w-4 text-slate-500" aria-hidden />
                {exporting ? 'Exporting…' : 'Download PNG'}
              </button>
              <button
                type="button"
                onClick={() => void runExportPdf()}
                disabled={exporting}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
              >
                <FiDownload className="h-4 w-4 text-slate-500" aria-hidden />
                {exporting ? 'Exporting…' : 'Download PDF'}
              </button>
            </div>

            <div
              ref={exportRef}
              className="relative mx-auto w-full max-w-[min(100%,520px)] overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(15,23,42,0.1)] ring-1 ring-black/[0.06]"
              style={{ aspectRatio: `${aspect}` }}
            >
              <PosterSvgLayer
                svgTemplate={poster.svgTemplate}
                className="absolute inset-0 h-full w-full overflow-hidden [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
              />
              <PosterTextOverlays
                nameField={poster.nameField}
                mobileField={poster.mobileField}
                variables={variables}
                interactive={false}
              />
            </div>

            <p className="text-center text-xs text-slate-500">
              {variables.name}
              <span className="mx-2 text-slate-300">·</span>
              {variables.mobile}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
