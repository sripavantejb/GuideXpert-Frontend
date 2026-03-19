import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiArrowRight, FiExternalLink } from 'react-icons/fi';

const FORM_URL = 'https://accounts.ccbp.in/public/register/guide-xpert';

export default function ExternalFormModal({ onClose }) {
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    try {
      // Accessing cross-origin contentWindow.location throws SecurityError if X-Frame-Options blocks
      const loc = iframeRef.current?.contentWindow?.location?.href;
      if (!loc || loc === 'about:blank') {
        setIframeBlocked(true);
      }
    } catch {
      setIframeBlocked(true);
    }
  };

  useEffect(() => {
    if (iframeBlocked) {
      window.open(FORM_URL, '_blank', 'noopener,noreferrer');
    }
  }, [iframeBlocked]);

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
      className={`fixed inset-0 z-9999 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out ${
        isIn ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal card */}
      <div
        className={`relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-in-out ${
          isIn ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-3'
        }`}
        style={{ height: 'min(88vh, 680px)' }}
      >
        {/* Top gradient bar */}
        <div className="h-1.5 shrink-0 bg-linear-to-r from-emerald-400 via-teal-400 to-blue-500" />

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Complete Your Registration</h3>
            <p className="mt-0.5 text-sm text-gray-500">Fill in your details to continue</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Iframe / fallback body */}
        <div className="relative min-h-0 flex-1 bg-gray-50">
          {iframeBlocked ? (
            /* Fallback: iframe was blocked by X-Frame-Options */
            <div className="flex h-full flex-col items-center justify-center gap-5 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-200/60">
                <FiExternalLink className="h-7 w-7 text-amber-500" />
              </div>
              <div className="max-w-sm">
                <p className="mb-1.5 text-base font-semibold text-gray-900">
                  Form opened in a new tab
                </p>
                <p className="text-sm leading-relaxed text-gray-500">
                  The registration form has been opened in a new browser tab. Complete it there,
                  then click{' '}
                  <span className="font-semibold text-gray-700">Continue to Dashboard</span>{' '}
                  below.
                </p>
              </div>
              <a
                href={FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#003366] underline-offset-2 hover:underline"
              >
                Reopen form
                <FiExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : (
            <>
              {/* Loading shimmer */}
              {!iframeLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#003366]" />
                    <p className="text-sm text-gray-400">Loading registration form…</p>
                  </div>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={FORM_URL}
                title="GuideXpert Registration Form"
                className="h-full w-full border-0"
                onLoad={handleIframeLoad}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
          <p className="text-xs text-gray-400">
            Complete the form above, then proceed to your dashboard.
          </p>
          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-[#003366] to-sidebar-blue px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:opacity-90 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003366] focus-visible:ring-offset-2"
          >
            Continue to Dashboard
            <FiArrowRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
