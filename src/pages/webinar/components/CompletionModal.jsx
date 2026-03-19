import { useState, useEffect } from 'react';
import { FiDownload, FiArrowRight } from 'react-icons/fi';

export default function CompletionModal({ onDownload, onContinue }) {
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

  const isIn = visible && !exiting;

  return (
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out ${isIn ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Card */}
      <div
        className={`relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-in-out ${
          isIn ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-3'
        }`}
      >
        {/* Top gradient bar */}
        <div className="h-1.5 bg-linear-to-r from-emerald-400 via-teal-400 to-blue-500" />

        <div className="px-8 pb-8 pt-7 text-center">
          {/* Icon ring */}
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200/50 ring-4 ring-amber-100">
            <span className="text-4xl leading-none" role="img" aria-label="trophy">
              🏆
            </span>
          </div>

          <h2 className="mb-3 text-2xl font-bold tracking-tight text-gray-900">
            🎉 Congratulations!
          </h2>

          <p className="mb-8 text-base leading-relaxed text-gray-500">
            You have successfully completed the{' '}
            <span className="font-semibold text-gray-800">GuideXpert Training</span> and earned
            your certificate.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onDownload}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
            >
              <FiDownload className="h-4 w-4 shrink-0" />
              Download Certificate
            </button>

            <button
              type="button"
              onClick={() => triggerExit(onContinue)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#003366] to-sidebar-blue px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:opacity-90 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003366] focus-visible:ring-offset-2"
            >
              Continue
              <FiArrowRight className="h-4 w-4 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
