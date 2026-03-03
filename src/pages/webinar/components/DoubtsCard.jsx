import { useState } from 'react';
import { FiSend, FiChevronDown, FiChevronRight } from 'react-icons/fi';

export default function DoubtsCard({ doubts, onDoubtsChange }) {
  const [input, setInput] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const newDoubts = [
      ...doubts,
      {
        id: `d-${Date.now()}`,
        text,
        status: 'pending',
        answer: null,
        upvotes: 0,
      },
    ];
    onDoubtsChange(newDoubts);
    setInput('');
  };

  const handleUpvote = (id) => {
    onDoubtsChange(
      doubts.map((d) => (d.id === id ? { ...d, upvotes: (d.upvotes ?? 0) + 1 } : d))
    );
  };

  const toggleAnswered = (id) => {
    onDoubtsChange(
      doubts.map((d) =>
        d.id === id
          ? { ...d, status: d.status === 'answered' ? 'pending' : 'answered', answer: d.answer ?? 'This has been addressed.' }
          : d
      )
    );
  };

  return (
    <div
      className="rounded-2xl bg-white border border-gray-200 shadow-card overflow-hidden flex flex-col"
      style={{ borderRadius: '16px' }}
    >
      <h2 className="px-4 py-3 text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100">
        Doubts
      </h2>
      <form onSubmit={handleSubmit} className="p-3 border-b border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy"
          aria-label="Question"
        />
        <button
          type="submit"
          className="p-2 rounded-lg bg-primary-navy text-white hover:bg-primary-navy/90 transition-colors shrink-0"
          aria-label="Send"
        >
          <FiSend className="w-4 h-4" />
        </button>
      </form>
      <div className="flex-1 overflow-y-auto max-h-[200px] p-3 space-y-2">
        {doubts.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">No doubts yet. Ask something!</p>
        ) : (
          doubts.map((d) => {
            const isExpanded = expandedId === d.id;
            const hasAnswer = d.status === 'answered' && d.answer;
            return (
              <div
                key={d.id}
                className="rounded-lg border border-gray-100 bg-gray-50 overflow-hidden"
              >
                <div className="flex items-start gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : d.id)}
                    className="shrink-0 mt-0.5 text-gray-500 hover:text-gray-700"
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-800">{d.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                          d.status === 'answered' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {d.status === 'answered' ? 'Answered' : 'Pending'}
                      </span>
                      {typeof d.upvotes === 'number' && (
                        <button
                          type="button"
                          onClick={() => handleUpvote(d.id)}
                          className="text-xs text-gray-500 hover:text-primary-navy"
                        >
                          +{d.upvotes} upvote{d.upvotes !== 1 ? 's' : ''}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {isExpanded && hasAnswer && (
                  <div className="px-2 pb-2 pl-8">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Answer</p>
                    <p className="text-sm text-gray-700">{d.answer}</p>
                  </div>
                )}
                {isExpanded && d.status === 'pending' && (
                  <div className="px-2 pb-2 pl-8">
                    <button
                      type="button"
                      onClick={() => toggleAnswered(d.id)}
                      className="text-xs text-primary-navy hover:underline"
                    >
                      Mark as answered
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
