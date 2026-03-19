import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiArrowRight, FiExternalLink } from 'react-icons/fi';

const FORM_URL = 'https://accounts.ccbp.in/public/register/guide-xpert';

export default function ExternalFormModal({ onClose }) {
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
  };

  const handleContinue = () => {
    setExiting(true);
    localStorage.setItem('training_completed', 'true');
    setTimeout(() => navigate('/counsellor/dashboard'), 350);
  };

  const handleClose = () => {
    setExiting(true);
    setTimeout(onClose, 320);
  };

  const isIn = visible && !exiting;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ease-out ${
        isIn ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300"
        aria-hidden
      />

      {/* Modal card */}
      <div
        className={`relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xl transition-all duration-300 ease-out ${
          isIn ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.98] translate-y-4'
        }`}
        style={{ height: 'min(90vh, 720px)' }}
      >
        {/* Accent bar */}
        <div className="h-1 shrink-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500" />

        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2
              id="registration-modal-title"
              className="text-xl font-semibold tracking-tight text-gray-900"
            >
              Complete Your Registration
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Fill in your details below to continue to your dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 rounded-full p-2.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
            aria-label="Close modal"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Form area — in-page iframe */}
        <div className="relative min-h-[320px] flex-1 bg-gray-50/80">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-50/90">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-[#003366]" />
              <p className="text-sm font-medium text-gray-500">Loading registration form…</p>
              <p className="text-xs text-gray-400">This may take a moment</p>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={FORM_URL}
            title="GuideXpert Registration Form"
            className="h-full min-h-[320px] w-full border-0"
            onLoad={handleIframeLoad}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-col gap-4 border-t border-gray-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-col gap-1 sm:gap-0">
            <p className="text-xs text-gray-500">
              Complete the form above, then proceed to your dashboard.
            </p>
            <a
              href={FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#003366] underline-offset-2 hover:underline"
            >
              Open form in new tab
              <FiExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          </div>
          <button
            type="button"
            onClick={handleContinue}
            className="order-first w-full shrink-0 rounded-xl bg-gradient-to-r from-[#003366] to-[#041e30] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003366] focus-visible:ring-offset-2 sm:order-none sm:w-auto"
          >
            <span className="inline-flex items-center gap-2">
              Continue to Dashboard
              <FiArrowRight className="h-4 w-4 shrink-0" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
