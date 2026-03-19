import { useState, useEffect } from 'react';
import { FiArrowRight, FiX } from 'react-icons/fi';

export default function CompletionModal({ onContinue, onClose }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const triggerExit = (callback) => {
    setExiting(true);
    setTimeout(callback, 320);
  };

  const handleClose = () => triggerExit(onClose ?? (() => {}));

  const isIn = visible && !exiting;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${isIn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" aria-hidden />

      {/* Card */}
      <div
        className={`relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xl transition-all duration-300 ease-out ${
          isIn ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.98] translate-y-4'
        }`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 rounded-full p-2.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
          aria-label="Close"
        >
          <FiX className="h-5 w-5" />
        </button>

        {/* Accent bar */}
        <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500" />

        <div className="px-8 pb-8 pt-8 text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200/40 ring-4 ring-amber-100/80">
            <span className="text-4xl leading-none" role="img" aria-hidden>
              🏆
            </span>
          </div>

          <h2
            id="completion-modal-title"
            className="mb-2 text-2xl font-semibold tracking-tight text-gray-900"
          >
            Congratulations!
          </h2>
          <p className="mb-2 text-sm font-medium text-amber-600">You did it</p>

          <p className="mb-8 text-base leading-relaxed text-gray-500">
            You have successfully completed the{' '}
            <span className="font-semibold text-gray-800">GuideXpert Training</span> and earned
            your certificate.
          </p>

          <button
            type="button"
            onClick={() => triggerExit(onContinue)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#041e30] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003366] focus-visible:ring-offset-2"
          >
            Continue
            <FiArrowRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
