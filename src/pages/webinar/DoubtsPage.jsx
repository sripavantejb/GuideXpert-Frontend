import { useState, useMemo } from 'react';
import { FiMessageCircle } from 'react-icons/fi';
import { useWebinar } from './context/WebinarContext';
import DoubtForm from './components/DoubtForm';
import DoubtsList from './components/DoubtsList';
import DoubtsRightPanel from './components/DoubtsRightPanel';
import { normalizeDoubt } from './utils/doubtHelpers';

export default function DoubtsPage() {
  const { doubts, setDoubts } = useWebinar();
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');

  const similarDoubts = useMemo(() => {
    const q = formTitle.trim().toLowerCase();
    if (q.length < 2) return [];
    return doubts
      .map(normalizeDoubt)
      .filter(Boolean)
      .filter(
        (d) =>
          (d.title && d.title.toLowerCase().includes(q)) ||
          (d.description && String(d.description).toLowerCase().includes(q))
      )
      .slice(0, 3);
  }, [doubts, formTitle]);

  const handleSubmit = (payload) => {
    const newDoubt = normalizeDoubt({
      ...payload,
      id: `d-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      status: 'pending',
      createdAt: Date.now(),
      answer: null,
      answeredAt: null,
      upvotes: 0,
    });
    setDoubts([...doubts, newDoubt]);
    setShowForm(false);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8 xl:gap-10">
        {/* Left column: main content */}
        <div className="min-w-0 flex flex-col">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-[1.75rem] font-semibold text-gray-900 tracking-tight">
                Doubts & Clarifications
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Ask questions and get answers from the training team.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-primary-navy text-white hover:bg-primary-navy/90 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2 shrink-0"
            >
              Ask a New Question
            </button>
          </header>

          {showForm && (
            <div className="rounded-[20px] bg-white p-5 sm:p-6 shadow-card border border-gray-200 mb-6 transition-all duration-200">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">New question</h2>
              <DoubtForm
                onSubmit={handleSubmit}
                onTitleChange={setFormTitle}
              />
              {similarDoubts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Similar questions
                  </p>
                  <ul className="space-y-1.5">
                    {similarDoubts.map((d) => (
                      <li key={d.id}>
                        <a
                          href={`#doubt-${d.id}`}
                          className="text-sm text-primary-navy hover:underline"
                        >
                          {d.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {doubts.length === 0 && !showForm ? (
            <div className="rounded-[20px] bg-gray-50/80 border border-gray-200 p-12 sm:p-16 text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-primary-navy/10 flex items-center justify-center mb-5">
                <FiMessageCircle className="w-10 h-10 text-primary-navy" aria-hidden />
              </div>
              <p className="text-gray-800 font-semibold text-lg">No questions yet</p>
              <p className="text-sm text-gray-500 mt-1 mb-6 max-w-sm">
                Ask your first question to get answers from the training team.
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-primary-navy text-white hover:bg-primary-navy/90 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2"
              >
                Ask your first question
              </button>
            </div>
          ) : (
            <DoubtsList
              doubts={doubts}
              onDoubtsChange={setDoubts}
              showFilters
              showSearch
              showSort
              emptyMessage="No doubts match your filters."
              emptySubmessage="Try changing filters or search."
            />
          )}
        </div>

        {/* Right column: stats + quick ask + help (large screens only) */}
        <aside className="hidden xl:block">
          <DoubtsRightPanel
            doubts={doubts}
            onAskSubmit={handleSubmit}
            onOpenForm={() => setShowForm(true)}
          />
        </aside>
      </div>
    </div>
  );
}
