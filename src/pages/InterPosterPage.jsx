import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { checkActivationEligibility } from '../utils/api';
import InterPosterPreview, {
  INTER_POSTER_WIDTH as POSTER_WIDTH,
  INTER_POSTER_HEIGHT as POSTER_HEIGHT,
  INTER_POSTER_EXPORT_LAYOUT,
} from '../components/Counsellor/InterPosterPreview';

function to10Digits(val) {
  if (val == null) return '';
  return String(val).replace(/\D/g, '').trim().slice(0, 10);
}

function safeFilename(str) {
  return (str || 'poster').replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').slice(0, 60);
}

const NAME_MAX_LEN = 50;
const PREVIEW_MAX_PX = 420;

function isMobileOrTablet() {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (typeof window !== 'undefined' && 'ontouchstart' in window);
}

function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function loadInterPosterImage() {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timeout = setTimeout(() => reject(new Error('Poster image load timeout')), 20000);
    img.onload = () => { clearTimeout(timeout); resolve(img); };
    img.onerror = () => { clearTimeout(timeout); reject(new Error('Failed to load poster image')); };
    img.src = '/interposter.svg';
  });
}

function drawFittedText(ctx, text, x, y, opts) {
  const { color = '#003366', maxWidth = 400, fontSize = 28, minFontSize = 16, fontWeight = 700, fontFamily = 'sans-serif', textAlign = 'left' } = opts || {};
  const raw = String(text || '').trim();
  if (!raw) return;
  let size = fontSize;
  let display = raw;
  const setFont = (s) => { ctx.font = `${fontWeight} ${s}px ${fontFamily}`; };
  setFont(size);
  while (size > minFontSize && ctx.measureText(display).width > maxWidth) { size -= 1; setFont(size); }
  if (ctx.measureText(display).width > maxWidth) {
    let lo = 0, hi = display.length, best = '';
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const c = `${display.slice(0, mid).trimEnd()}…`;
      if (ctx.measureText(c).width <= maxWidth) { best = c; lo = mid + 1; } else { hi = mid - 1; }
    }
    display = best || display;
  }
  ctx.fillStyle = color;
  ctx.textAlign = textAlign;
  setFont(size);
  ctx.fillText(display, x, y);
}

function drawInterPosterToCanvas(img, fullName, mobileNumber, scale = 2) {
  const w = POSTER_WIDTH * scale;
  const h = POSTER_HEIGHT * scale;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(img, 0, 0, w, h);

  const sx = scale;
  const nl = INTER_POSTER_EXPORT_LAYOUT.name;
  const pl = INTER_POSTER_EXPORT_LAYOUT.phone;

  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  drawFittedText(ctx, String(fullName || ' ').trim().slice(0, NAME_MAX_LEN) || ' ', nl.x * sx, nl.y * sx, {
    color: nl.color, maxWidth: nl.maxWidth * sx,
    fontSize: nl.fontSize * sx, minFontSize: nl.minFontSize * sx,
    fontWeight: nl.fontWeight, fontFamily: nl.fontFamily, textAlign: nl.textAlign,
  });
  drawFittedText(ctx, mobileNumber ? mobileNumber : ' ', pl.x * sx, pl.y * sx, {
    color: pl.color, maxWidth: pl.maxWidth * sx,
    fontSize: pl.fontSize * sx, minFontSize: pl.minFontSize * sx,
    fontWeight: pl.fontWeight, fontFamily: pl.fontFamily, textAlign: pl.textAlign,
  });
  return canvas;
}

export default function InterPosterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [showIneligibleModal, setShowIneligibleModal] = useState(false);
  const [ineligibleMessage, setIneligibleMessage] = useState('');
  const [generating, setGenerating] = useState(false);
  const [exportImageReady, setExportImageReady] = useState(false);
  const [pendingDownload, setPendingDownload] = useState(null);
  const [iosResult, setIosResult] = useState(null);
  const iosResultBlobUrlRef = useRef(null);
  const posterRef = useRef(null);
  const exportRef = useRef(null);
  const exportWrapperRef = useRef(null);
  const captureContainerRef = useRef(null);
  const exportImageReadyRef = useRef(false);
  const pendingDownloadRef = useRef({ url: null, filename: null, revoke: false });
  const previewBoxRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(PREVIEW_MAX_PX / POSTER_WIDTH);

  const mobile10 = to10Digits(mobileNumber);
  const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
  const displayName = fullName.trim().slice(0, NAME_MAX_LEN);
  const formLocked = false;

  useEffect(() => {
    const el = previewBoxRef.current;
    if (!el) return;
    const update = () => {
      const available = el.clientWidth || PREVIEW_MAX_PX;
      const target = Math.min(available, PREVIEW_MAX_PX);
      setPreviewScale(Math.max(0.25, target / POSTER_WIDTH));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const canDownload = displayName.length > 0 && mobile10.length === 10;

  async function verifyEligibility() {
    const result = await checkActivationEligibility(mobile10);
    const payload = result.data?.data ?? result.data;
    const isEligible = Boolean(result.eligible ?? payload?.exists ?? payload?.eligible ?? false);
    if (result.success && isEligible) return true;
    setIneligibleMessage(result.message || payload?.message || 'You have not completed the activation form yet. Please complete it first.');
    setShowIneligibleModal(true);
    return false;
  }

  function waitForExportReady(ms) {
    return new Promise((resolve) => {
      if (exportImageReadyRef.current) return resolve();
      const deadline = Date.now() + ms;
      const id = setInterval(() => { if (exportImageReadyRef.current || Date.now() >= deadline) { clearInterval(id); resolve(); } }, 50);
    });
  }

  function showExportWrapper() {
    const wrapper = exportWrapperRef.current;
    const container = captureContainerRef.current;
    if (!wrapper) return;
    if (isIOS()) {
      wrapper.style.position = 'absolute'; wrapper.style.left = '0'; wrapper.style.top = '0';
      if (container) { container.style.zIndex = '9998'; container.style.overflow = 'visible'; }
    } else if (isMobileOrTablet()) { wrapper.style.left = '-9999px'; wrapper.style.top = '0'; }
    Object.assign(wrapper.style, { opacity: '1', zIndex: '9998', overflow: 'visible', minWidth: `${POSTER_WIDTH}px`, maxWidth: `${POSTER_WIDTH}px`, minHeight: `${POSTER_HEIGHT}px`, maxHeight: `${POSTER_HEIGHT}px`, transform: 'translateZ(0)' });
  }

  function hideExportWrapper() {
    const wrapper = exportWrapperRef.current;
    const container = captureContainerRef.current;
    if (!wrapper) return;
    Object.assign(wrapper.style, { opacity: '0', zIndex: '-1', overflow: 'hidden', left: '', top: '', minWidth: '', maxWidth: '', minHeight: '', maxHeight: '', transform: '' });
    if (isIOS()) { wrapper.style.position = ''; if (container) { container.style.zIndex = '-1'; container.style.overflow = 'hidden'; } }
  }

  function getH2cOptions(scale, target) {
    const ios = isIOS();
    const el = target || exportRef.current;
    return {
      scale,
      ...(ios ? { width: POSTER_WIDTH * scale, height: POSTER_HEIGHT * scale } : { width: POSTER_WIDTH, height: POSTER_HEIGHT }),
      windowWidth: ios ? (el?.scrollWidth || POSTER_WIDTH) : POSTER_WIDTH + 20,
      windowHeight: ios ? (el?.scrollHeight || POSTER_HEIGHT) : POSTER_HEIGHT + 20,
      scrollX: 0, scrollY: 0, useCORS: true, backgroundColor: '#ffffff', logging: false, allowTaint: true, imageTimeout: 0,
      onclone: (doc, clone) => {
        doc.documentElement.style.overflow = 'visible';
        if (doc.body) doc.body.style.overflow = 'visible';
        if (ios) {
          const d = { width: `${POSTER_WIDTH}px`, height: `${POSTER_HEIGHT}px`, minWidth: `${POSTER_WIDTH}px`, minHeight: `${POSTER_HEIGHT}px` };
          Object.assign(doc.documentElement.style, d);
          if (doc.body) Object.assign(doc.body.style, d);
          let n = clone; while (n && n !== doc.body) { Object.assign(n.style, { ...d, overflow: 'visible' }); n = n.parentElement; }
        }
        Object.assign(clone.style, { opacity: '1', visibility: 'visible', zIndex: '9999', overflow: 'visible', position: 'relative', left: '0', top: '0' });
        let p = clone.parentElement;
        while (p && p !== doc.body) {
          if (p.style.position === 'fixed') { p.style.position = 'absolute'; p.style.left = '0'; p.style.top = '0'; }
          p = p.parentElement;
        }
      },
    };
  }

  const waitImg = isMobileOrTablet() ? 800 : 3000;
  const waitLayout = isMobileOrTablet() ? 100 : 400;

  function triggerPending() {
    const { url, filename, revoke } = pendingDownloadRef.current;
    if (!url) return;
    const a = document.createElement('a'); a.download = filename; a.href = url; a.click();
    if (revoke) setTimeout(() => URL.revokeObjectURL(url), 2000);
    pendingDownloadRef.current = { url: null, filename: null, revoke: false }; setPendingDownload(null);
  }

  const handlePng = async () => {
    if (!(await verifyEligibility())) return;
    setGenerating(true); setPendingDownload(null);
    try {
      if (isMobileOrTablet()) {
        const img = await loadInterPosterImage();
        const c = drawInterPosterToCanvas(img, fullName, mobile10, 2);
        setIosResult({ url: c.toDataURL('image/png'), type: 'image' });
      } else {
        const t = exportRef.current || posterRef.current; if (!t) return;
        await waitForExportReady(waitImg); await new Promise(r => setTimeout(r, waitLayout));
        showExportWrapper(); await new Promise(r => requestAnimationFrame(r));
        const c = await html2canvas(t, getH2cOptions(2, t));
        const w = POSTER_WIDTH * 2, h = POSTER_HEIGHT * 2;
        const crop = document.createElement('canvas'); crop.width = w; crop.height = h;
        crop.getContext('2d')?.drawImage(c, 0, 0, Math.min(c.width, w), Math.min(c.height, h), 0, 0, w, h);
        const url = crop.toDataURL('image/png');
        const fn = `GuideXpert-Poster-${safeFilename(fullName)}-${Date.now()}.png`;
        const a = document.createElement('a'); a.download = fn; a.href = url; a.click();
        if (isMobileOrTablet()) { pendingDownloadRef.current = { url, filename: fn }; setPendingDownload('png'); }
      }
    } catch (e) { console.error(e); } finally { if (!isMobileOrTablet()) hideExportWrapper(); }
    setGenerating(false);
  };

  const handlePdf = async () => {
    if (!(await verifyEligibility())) return;
    setGenerating(true); setPendingDownload(null);
    try {
      if (isMobileOrTablet()) {
        const img = await loadInterPosterImage();
        const c = drawInterPosterToCanvas(img, fullName, mobile10, 2);
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [POSTER_WIDTH, POSTER_HEIGHT], compress: true });
        pdf.addImage(c.toDataURL('image/png'), 'PNG', 0, 0, POSTER_WIDTH, POSTER_HEIGHT);
        const u = URL.createObjectURL(pdf.output('blob'));
        iosResultBlobUrlRef.current = u; setIosResult({ url: u, type: 'pdf' });
      } else {
        const t = exportRef.current || posterRef.current; if (!t) return;
        await waitForExportReady(waitImg); await new Promise(r => setTimeout(r, waitLayout));
        showExportWrapper(); await new Promise(r => requestAnimationFrame(r));
        const c = await html2canvas(t, getH2cOptions(2, t));
        const w = POSTER_WIDTH * 2, h = POSTER_HEIGHT * 2;
        const crop = document.createElement('canvas'); crop.width = w; crop.height = h;
        crop.getContext('2d')?.drawImage(c, 0, 0, Math.min(c.width, w), Math.min(c.height, h), 0, 0, w, h);
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [POSTER_WIDTH, POSTER_HEIGHT], compress: true });
        pdf.addImage(crop.toDataURL('image/png'), 'PNG', 0, 0, POSTER_WIDTH, POSTER_HEIGHT);
        const fn = `GuideXpert-Poster-${safeFilename(fullName)}-${Date.now()}.pdf`;
        const blob = pdf.output('blob'); const u = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.download = fn; a.href = u; a.click();
        if (isMobileOrTablet()) { pendingDownloadRef.current = { url: u, filename: fn, revoke: true }; setPendingDownload('pdf'); }
        else setTimeout(() => URL.revokeObjectURL(u), 5000);
      }
    } catch (e) { console.error(e); } finally { if (!isMobileOrTablet()) hideExportWrapper(); }
    setGenerating(false);
  };

  function closeIos() {
    if (iosResultBlobUrlRef.current) { try { URL.revokeObjectURL(iosResultBlobUrlRef.current); } catch (_) { /* */ } iosResultBlobUrlRef.current = null; }
    setIosResult(null);
  }

  const scaledW = Math.round(POSTER_WIDTH * previewScale);
  const scaledH = Math.round(POSTER_HEIGHT * previewScale);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Generating overlay */}
        {generating && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-white shadow-2xl px-10 py-8 max-w-[240px]">
              <div className="w-8 h-8 rounded-full border-[3px] border-primary-navy border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-slate-800">Generating…</p>
            </div>
          </div>
        )}

        {/* iOS save result */}
        {iosResult && (
          <div className="fixed inset-0 z-[10001] flex flex-col bg-black">
            <div className="flex-1 flex flex-col items-center justify-center min-h-0 p-4">
              {iosResult.type === 'image'
                ? <img src={iosResult.url} alt="Poster" className="max-w-full max-h-full object-contain select-none" draggable={false} />
                : <iframe src={iosResult.url} title="PDF" className="w-full flex-1 min-h-0 border-0" />}
              <p className="text-white/80 text-xs text-center mt-3">
                {iosResult.type === 'image' ? 'Long-press → Save Image' : 'Tap Share → Save to Files'}
              </p>
            </div>
            <div className="p-4 bg-gray-900">
              <button onClick={closeIos} className="w-full py-3 rounded-xl bg-white text-gray-900 font-semibold text-sm">Close</button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-primary-navy tracking-tight">Download Your Counsellor Poster</h1>
          <p className="text-sm text-slate-500 mt-1.5 max-w-lg mx-auto">Enter your details below. Eligibility is verified when you click download.</p>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* Left — Form */}
            <div className="p-5 sm:p-7 border-b md:border-b-0 md:border-r border-slate-100">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5">Your Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">First Name</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Enter first name" disabled={formLocked}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/20 focus:bg-white transition" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Last Name</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Enter last name" disabled={formLocked}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/20 focus:bg-white transition" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Mobile Number</label>
                  <input type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} placeholder="10-digit mobile number" maxLength={14} disabled={formLocked}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/20 focus:bg-white transition" />
                  {mobileNumber && mobile10.length !== 10 && <p className="mt-1 text-xs text-red-500">Enter a valid 10-digit number.</p>}
                </div>
              </div>

              <div className="mt-5 text-xs text-amber-700 bg-amber-50/80 border border-amber-200/60 rounded-lg px-3 py-2.5 leading-relaxed">
                Please double-check your name — it will appear on the poster exactly as entered.
              </div>

              {/* Download buttons — always visible when form is valid */}
              <div className="mt-5 flex flex-col gap-2.5">
                <button onClick={handlePng} disabled={generating || !canDownload}
                  className="w-full rounded-lg bg-primary-navy py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-navy/20 hover:shadow-lg hover:shadow-primary-navy/30 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {generating ? 'Generating…' : 'Download as PNG'}
                </button>
                <button onClick={handlePdf} disabled={generating || !canDownload}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {generating ? 'Generating…' : 'Download as PDF'}
                </button>
                {!canDownload && (
                  <p className="text-xs text-slate-400 text-center">Enter your name and a valid 10-digit number to enable download.</p>
                )}
                {pendingDownload && (
                  <button onClick={triggerPending}
                    className="w-full rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition">
                    Tap to save file
                  </button>
                )}
              </div>
            </div>

            {/* Right — Preview */}
            <div className="p-5 sm:p-7 flex flex-col items-center justify-center bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 self-start">Preview</h2>

              <div ref={previewBoxRef} className="relative w-full flex justify-center" style={{ maxWidth: PREVIEW_MAX_PX }}>
                <div
                  className="rounded-lg overflow-hidden shadow-md border border-slate-200/80"
                  style={{ width: scaledW, height: scaledH }}
                >
                  <div style={{ width: POSTER_WIDTH, height: POSTER_HEIGHT, transform: `scale(${previewScale})`, transformOrigin: 'top left' }}>
                    <InterPosterPreview ref={posterRef} fullName={displayName || fullName} mobileNumber={mobile10 || undefined} />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-3 text-center">Live preview — updates as you type.</p>
            </div>
          </div>
        </div>

        {/* Hidden export node — always mounted so it's ready when download is clicked */}
        <div ref={captureContainerRef} aria-hidden="true"
          style={{ position: 'fixed', left: 0, top: 0, width: POSTER_WIDTH, height: POSTER_HEIGHT, minWidth: POSTER_WIDTH, maxWidth: POSTER_WIDTH, minHeight: POSTER_HEIGHT, maxHeight: POSTER_HEIGHT, overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }}>
          <div ref={exportWrapperRef} aria-hidden="true"
            style={{ position: 'fixed', left: 0, top: 0, width: POSTER_WIDTH, height: POSTER_HEIGHT, minWidth: POSTER_WIDTH, maxWidth: POSTER_WIDTH, minHeight: POSTER_HEIGHT, maxHeight: POSTER_HEIGHT, overflow: 'hidden', opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
            <InterPosterPreview ref={exportRef} fullName={displayName || fullName} mobileNumber={mobile10 || undefined} forExport
              onExportImageLoad={() => { exportImageReadyRef.current = true; setExportImageReady(true); }} />
          </div>
        </div>

        {/* Ineligible modal */}
        {showIneligibleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1.5">Activation Form Not Submitted</h2>
              <p className="text-sm text-slate-500 mb-5">{ineligibleMessage || 'Please complete the activation form first, then return here to download your poster.'}</p>
              <button onClick={() => { setShowIneligibleModal(false); navigate('/'); }}
                className="w-full py-2.5 text-sm font-semibold text-white bg-primary-navy rounded-xl hover:opacity-90 transition">
                Go to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
