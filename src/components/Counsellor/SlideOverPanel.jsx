import { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';

export default function SlideOverPanel({ title, onClose, children, isOpen }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-200"
        aria-hidden
        onClick={onClose}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="slide-over-title"
        className="fixed inset-y-0 right-0 w-full max-w-lg bg-white z-50 flex flex-col focus:outline-none shadow-2xl shadow-slate-900/10 border-l border-slate-200/80"
      >
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#003366] text-white shadow-sm">
              <span className="text-sm font-bold">{title.includes('Edit') ? 'E' : '+'}</span>
            </div>
            <h2 id="slide-over-title" className="text-lg font-semibold text-slate-800 tracking-tight">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-500 hover:bg-white/80 hover:text-slate-700 transition-all duration-150 border border-transparent hover:border-slate-200"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 bg-gradient-to-b from-slate-50/50 to-white min-h-0">
          {children}
        </div>
      </div>
    </>
  );
}
