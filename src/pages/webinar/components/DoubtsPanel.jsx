import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import DoubtForm from './DoubtForm';
import DoubtsList from './DoubtsList';
import { useWebinar } from '../context/WebinarContext';
import { normalizeDoubt } from '../utils/doubtHelpers';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function DoubtsPanel({ open, onClose, doubts, onDoubtsChange }) {
  const { sidebarExpanded } = useWebinar();
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (!open) return;
    previousActiveElement.current = document.activeElement;
    closeButtonRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        const prev = previousActiveElement.current;
        onClose();
        if (prev && typeof prev.focus === 'function') {
          requestAnimationFrame(() => prev.focus());
        }
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter(
        (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const handleClose = () => {
    const prev = previousActiveElement.current;
    onClose();
    if (prev && typeof prev.focus === 'function') {
      requestAnimationFrame(() => prev.focus());
    }
  };

  const handleSubmit = (payload) => {
    const newDoubt = normalizeDoubt({
      ...payload,
      id: `d-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      status: 'pending',
      createdAt: Date.now(),
      answer: null,
      answeredAt: null,
    });
    onDoubtsChange([...doubts, newDoubt]);
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-30 transition-opacity duration-200 lg:bg-black/20"
        aria-hidden
        onClick={handleClose}
      />
      <aside
        ref={panelRef}
        className={`fixed top-0 bottom-0 left-0 z-40 w-full max-w-full lg:max-w-[420px] bg-white border-r border-gray-200 shadow-xl flex flex-col transition-[left] duration-200 ease-out overflow-x-hidden ${sidebarExpanded ? 'lg:left-[240px]' : 'lg:left-[72px]'}`}
        style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.08)' }}
        aria-label="Doubts panel"
        aria-modal="true"
      >
        <div className="shrink-0 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Doubts & Clarifications</h2>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={handleClose}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close panel"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Ask and get answers</p>
          <Link
            to="/webinar/doubts"
            onClick={handleClose}
            className="text-xs text-primary-navy font-medium hover:underline mt-2 inline-block"
          >
            See all on Doubts page →
          </Link>
        </div>
        <div className="shrink-0 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <p className="text-xs font-medium text-gray-600 mb-2">Ask a new question</p>
          <DoubtForm onSubmit={handleSubmit} compact />
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 px-4 py-3">
          <DoubtsList
            doubts={doubts}
            onDoubtsChange={onDoubtsChange}
            showFilters
            showSearch
            emptyMessage={doubts.length === 0 ? 'No doubts yet — ask one below' : 'No matching doubts.'}
            emptySubmessage="Ask your first question above or open the full Doubts page."
          />
        </div>
      </aside>
    </>
  );
}
