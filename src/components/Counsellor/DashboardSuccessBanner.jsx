import { useState, useEffect } from 'react';
import { FiX, FiAward } from 'react-icons/fi';

export default function DashboardSuccessBanner() {
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const flag = localStorage.getItem('training_completed');
    if (flag === 'true') {
      localStorage.removeItem('training_completed');
      setShow(true);
      // Double rAF ensures CSS transition fires after element is painted
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimate(true));
      });
    }
  }, []);

  const handleDismiss = () => {
    setAnimate(false);
    setTimeout(() => setDismissed(true), 450);
  };

  if (!show || dismissed) return null;

  return (
    <div
      className={`overflow-hidden transition-all duration-500 ease-out ${
        animate ? 'max-h-28 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 ring-1 ring-emerald-200/60">
            <FiAward className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="min-w-0 truncate text-sm font-medium text-emerald-800 sm:whitespace-normal sm:wrap-break-word">
            🎉 You have successfully completed your training and earned your certificate!
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-lg p-1.5 text-emerald-500 transition-colors hover:bg-emerald-100 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
