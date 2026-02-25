import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { checkPosterEligibility } from '../../utils/api';
import PosterPreview from '../../components/Counsellor/PosterPreview';

function to10Digits(val) {
  if (val == null) return '';
  return String(val).replace(/\D/g, '').trim().slice(0, 10);
}

function safeFilename(str) {
  return (str || 'poster').replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').slice(0, 60);
}

const POSTER_WIDTH = 810;
const POSTER_HEIGHT = 1440;
const PREVIEW_SCALE = 0.38;

function isMobileOrTablet() {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (typeof window !== 'undefined' && 'ontouchstart' in window);
}

export default function Certificate() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showIneligibleModal, setShowIneligibleModal] = useState(false);
  const [ineligibleMessage, setIneligibleMessage] = useState('');
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [exportImageReady, setExportImageReady] = useState(false);
  const [pendingDownload, setPendingDownload] = useState(null);
  const posterRef = useRef(null);
  const exportRef = useRef(null);
  const exportWrapperRef = useRef(null);
  const exportImageReadyRef = useRef(false);
  const pendingDownloadRef = useRef({ url: null, filename: null, revoke: false });

  const mobile10 = to10Digits(mobileNumber);
  const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
  const canSubmit = firstName.trim() && lastName.trim() && mobile10.length === 10 && confirmChecked;
  const formLocked = eligible;

  const handleOpenConfirmModal = () => {
    if (!canSubmit) return;
    setShowConfirmModal(true);
  };

  useEffect(() => {
    if (!eligible) {
      setExportImageReady(false);
      exportImageReadyRef.current = false;
    }
  }, [eligible]);

  const handleConfirmAndGenerate = async () => {
    setShowConfirmModal(false);
    setCheckingEligibility(true);
    const result = await checkPosterEligibility(mobile10);
    setCheckingEligibility(false);
    const eligibleResult = result.data?.eligible ?? result.eligible;
    if (result.success && eligibleResult) {
      setEligible(true);
    } else {
      setIneligibleMessage(result.data?.message || result.message || 'Your training is not yet completed. Please complete the training to download the poster.');
      setShowIneligibleModal(true);
    }
  };

  function waitForExportImageReadyWithTimeout(ms) {
    return new Promise((resolve) => {
      if (exportImageReadyRef.current) return resolve();
      const deadline = Date.now() + ms;
      const id = setInterval(() => {
        if (exportImageReadyRef.current || Date.now() >= deadline) {
          clearInterval(id);
          resolve();
        }
      }, 50);
    });
  }

  function showExportWrapper() {
    const wrapper = exportWrapperRef.current;
    if (!wrapper) return;
    if (isMobileOrTablet()) {
      wrapper.style.left = '-9999px';
      wrapper.style.top = '0';
    }
    wrapper.style.opacity = '1';
    wrapper.style.zIndex = '9999';
    wrapper.style.overflow = 'visible';
    wrapper.style.minWidth = `${POSTER_WIDTH}px`;
    wrapper.style.maxWidth = `${POSTER_WIDTH}px`;
    wrapper.style.minHeight = `${POSTER_HEIGHT}px`;
    wrapper.style.maxHeight = `${POSTER_HEIGHT}px`;
    wrapper.style.transform = 'translateZ(0)';
  }

  function hideExportWrapper() {
    const wrapper = exportWrapperRef.current;
    if (!wrapper) return;
    wrapper.style.opacity = '0';
    wrapper.style.zIndex = '-1';
    wrapper.style.overflow = 'hidden';
    wrapper.style.left = '';
    wrapper.style.top = '';
    wrapper.style.minWidth = '';
    wrapper.style.maxWidth = '';
    wrapper.style.minHeight = '';
    wrapper.style.maxHeight = '';
    wrapper.style.transform = '';
  }

  const getHtml2canvasOptions = (scale) => ({
    scale,
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    windowWidth: POSTER_WIDTH + 20,
    windowHeight: POSTER_HEIGHT + 20,
    scrollX: 0,
    scrollY: 0,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    allowTaint: true,
    imageTimeout: 0,
    onclone: (clonedDoc, clonedElement) => {
      clonedDoc.documentElement.style.overflow = 'visible';
      if (clonedDoc.body) clonedDoc.body.style.overflow = 'visible';
      clonedElement.style.opacity = '1';
      clonedElement.style.visibility = 'visible';
      clonedElement.style.zIndex = '9999';
      clonedElement.style.overflow = 'visible';
    },
  });

  const imageWaitMs = isMobileOrTablet() ? 600 : 2500;
  const layoutSettleMs = isMobileOrTablet() ? 80 : 300;

  function triggerPendingDownload() {
    const { url, filename, revoke } = pendingDownloadRef.current;
    if (!url || !filename) return;
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    if (revoke) setTimeout(() => URL.revokeObjectURL(url), 2000);
    pendingDownloadRef.current = { url: null, filename: null, revoke: false };
    setPendingDownload(null);
  }

  const handleDownloadPng = async () => {
    const target = exportRef.current || posterRef.current;
    if (!target) return;
    setGenerating(true);
    setPendingDownload(null);
    try {
      await waitForExportImageReadyWithTimeout(imageWaitMs);
      await new Promise((r) => setTimeout(r, layoutSettleMs));
      showExportWrapper();
      await new Promise((r) => requestAnimationFrame(r));
      const scale = 2;
      const canvas = await html2canvas(target, getHtml2canvasOptions(scale));
      const w = POSTER_WIDTH * scale;
      const h = POSTER_HEIGHT * scale;
      const cropped = document.createElement('canvas');
      cropped.width = w;
      cropped.height = h;
      const ctx = cropped.getContext('2d');
      ctx.drawImage(canvas, 0, 0, w, h, 0, 0, w, h);
      const dataUrl = cropped.toDataURL('image/png');
      const filename = `GuideXpert-Poster-${safeFilename(fullName)}-${Date.now()}.png`;
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
      if (isMobileOrTablet()) {
        pendingDownloadRef.current = { url: dataUrl, filename };
        setPendingDownload('png');
      }
    } catch (err) {
      console.error(err);
    } finally {
      hideExportWrapper();
    }
    setGenerating(false);
  };

  const handleDownloadPdf = async () => {
    const target = exportRef.current || posterRef.current;
    if (!target) return;
    setGenerating(true);
    setPendingDownload(null);
    try {
      await waitForExportImageReadyWithTimeout(imageWaitMs);
      await new Promise((r) => setTimeout(r, layoutSettleMs));
      showExportWrapper();
      await new Promise((r) => requestAnimationFrame(r));
      const scale = 2;
      const canvas = await html2canvas(target, getHtml2canvasOptions(scale));
      const w = POSTER_WIDTH * scale;
      const h = POSTER_HEIGHT * scale;
      const cropped = document.createElement('canvas');
      cropped.width = w;
      cropped.height = h;
      const ctx = cropped.getContext('2d');
      ctx.drawImage(canvas, 0, 0, w, h, 0, 0, w, h);
      const imgData = cropped.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [POSTER_WIDTH, POSTER_HEIGHT],
        compress: true,
      });
      pdf.addImage(imgData, 'PNG', 0, 0, POSTER_WIDTH, POSTER_HEIGHT);
      const filename = `GuideXpert-Poster-${safeFilename(fullName)}-${Date.now()}.pdf`;
      const blob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(blob);
      const pdfLink = document.createElement('a');
      pdfLink.download = filename;
      pdfLink.href = pdfUrl;
      pdfLink.click();
      if (isMobileOrTablet()) {
        pendingDownloadRef.current = { url: pdfUrl, filename, revoke: true };
        setPendingDownload('pdf');
      } else {
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      hideExportWrapper();
    }
    setGenerating(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Download Poster</h1>
      <p className="text-gray-600 mb-6">Enter your details and verify your training completion to generate and download your official poster.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">First Name</span>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
              disabled={formLocked}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-navy focus:ring-1 focus:ring-primary-navy disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Last Name</span>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              disabled={formLocked}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-navy focus:ring-1 focus:ring-primary-navy disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Mobile Number</span>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="10-digit mobile number"
              maxLength={14}
              disabled={formLocked}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-navy focus:ring-1 focus:ring-primary-navy disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {mobileNumber && mobile10.length !== 10 && (
              <p className="mt-1 text-sm text-red-600">Enter a valid 10-digit mobile number.</p>
            )}
          </label>

          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            Please ensure your name is correct. This name will appear on your official poster and cannot be changed later.
          </p>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmChecked}
              onChange={(e) => setConfirmChecked(e.target.checked)}
              disabled={formLocked}
              className="mt-1 rounded border-gray-300 text-primary-navy focus:ring-primary-navy"
            />
            <span className="text-sm text-gray-700">
              I confirm that the above details are correct and will appear on my poster.
            </span>
          </label>

          {!eligible ? (
            <button
              type="button"
              onClick={handleOpenConfirmModal}
              disabled={!canSubmit || checkingEligibility}
              className="w-full inline-flex items-center justify-center rounded-md bg-primary-navy px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-blue-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {checkingEligibility ? 'Checking eligibility…' : 'Check Eligibility'}
            </button>
          ) : (
            <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800">
              You are eligible. Your poster is ready to download below.
            </div>
          )}
        </div>

        {/* Poster preview — 9:16, scaled to fit page */}
        <div className="lg:col-span-2 flex flex-col items-center">
          <div className="relative w-full flex flex-col items-center" style={{ width: POSTER_WIDTH * PREVIEW_SCALE, maxWidth: '100%' }}>
            {checkingEligibility && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded z-10">
                <span className="text-gray-600 font-medium">Checking eligibility…</span>
              </div>
            )}
            <div
              className="overflow-hidden rounded-md"
              style={{ width: POSTER_WIDTH * PREVIEW_SCALE, height: POSTER_HEIGHT * PREVIEW_SCALE }}
            >
              <div
                style={{
                  width: POSTER_WIDTH,
                  height: POSTER_HEIGHT,
                  transform: `scale(${PREVIEW_SCALE})`,
                  transformOrigin: 'top left',
                }}
              >
                <PosterPreview
                  ref={posterRef}
                  fullName={fullName}
                  mobileNumber={mobile10 || undefined}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">
              {eligible ? 'Your poster is ready. Use the buttons below to download.' : 'Preview updates as you type. Check eligibility to enable download.'}
            </p>
          </div>
          {eligible && (
            <div className="flex flex-wrap gap-3 mt-4 w-full justify-center">
              <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800 mb-2 w-full text-center">
                You are eligible. Your poster is ready to download.
              </div>
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={generating}
                className="inline-flex items-center rounded-md bg-primary-navy px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-blue-800 disabled:opacity-60"
              >
                {generating ? 'Generating…' : 'Download as PNG'}
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={generating}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
              >
                {generating ? 'Generating…' : 'Download as PDF'}
              </button>
              {pendingDownload && (
                <button
                  type="button"
                  onClick={triggerPendingDownload}
                  className="inline-flex items-center rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700"
                >
                  Download now (tap to save)
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hidden poster for PNG/PDF only — forExport=true so tagline fits in export (preview unchanged) */}
      {eligible && (
        <div
          ref={exportWrapperRef}
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: POSTER_WIDTH,
            height: POSTER_HEIGHT,
            minWidth: POSTER_WIDTH,
            maxWidth: POSTER_WIDTH,
            minHeight: POSTER_HEIGHT,
            maxHeight: POSTER_HEIGHT,
            overflow: 'hidden',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: -1,
            boxSizing: 'border-box',
          }}
        >
          <PosterPreview
            ref={exportRef}
            fullName={fullName}
            mobileNumber={mobile10 || undefined}
            forExport
            onExportImageLoad={() => {
              exportImageReadyRef.current = true;
              setExportImageReady(true);
            }}
          />
        </div>
      )}

      {/* Confirmation modal (before eligibility check) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 id="confirm-modal-title" className="text-lg font-semibold text-gray-900 mb-2">Confirm details</h2>
            <p className="text-gray-600 text-sm mb-4">
              These details will be used to generate your official poster. Please confirm before proceeding.
            </p>
            <div className="bg-gray-50 rounded-md p-3 mb-4 text-sm">
              <p><span className="font-medium text-gray-700">Full Name:</span> {fullName || '—'}</p>
              <p><span className="font-medium text-gray-700">Mobile:</span> {mobile10 || '—'}</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Edit Details
              </button>
              <button
                type="button"
                onClick={handleConfirmAndGenerate}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-navy rounded-md hover:bg-primary-blue-800"
              >
                Confirm & Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ineligible modal */}
      {showIneligibleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="ineligible-modal-title">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 id="ineligible-modal-title" className="text-lg font-semibold text-gray-900 mb-2">Training not completed</h2>
            <p className="text-gray-600 text-sm mb-4">{ineligibleMessage}</p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowIneligibleModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-navy rounded-md hover:bg-primary-blue-800"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
