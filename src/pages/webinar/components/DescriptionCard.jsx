import { FiFileText } from 'react-icons/fi';

export default function DescriptionCard({ session }) {
  if (!session?.description) {
    return (
      <div
        className="rounded-[20px] bg-white border border-gray-200 shadow-card overflow-hidden flex flex-col transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5"
      >
        <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <FiFileText className="w-4 h-4 text-primary-navy opacity-80" aria-hidden />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Description
          </h2>
        </div>
        <div className="p-4 sm:p-5 text-sm text-gray-500 flex flex-col items-center justify-center py-12">
          <FiFileText className="w-10 h-10 text-gray-300 mb-2" aria-hidden />
          <p>Select a session to view description.</p>
        </div>
      </div>
    );
  }

  const d = session.description;
  const keyTopicsRaw = d.keyTopics;
  const keyTopicsList = Array.isArray(keyTopicsRaw)
    ? keyTopicsRaw
    : typeof keyTopicsRaw === 'string'
      ? keyTopicsRaw.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

  const sections = [
    { label: 'Start point', content: d.startPoint, isChips: false },
    { label: 'Key topics covered', content: keyTopicsList.length ? null : (typeof keyTopicsRaw === 'string' ? keyTopicsRaw : ''), isChips: true, chips: keyTopicsList },
    { label: 'Learning outcome', content: d.learningOutcome, isChips: false },
    { label: 'Important notes', content: d.importantNotes, isChips: false },
  ].filter((s) => s.content || (s.chips && s.chips.length > 0));

  return (
    <div
      className="rounded-[20px] bg-white border border-gray-200 shadow-card overflow-hidden flex flex-col max-h-[280px] sm:max-h-[320px] transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5"
    >
      <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
        <FiFileText className="w-4 h-4 text-primary-navy opacity-80" aria-hidden />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Description
        </h2>
      </div>
      <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0">
        <ul className="space-y-5">
          {sections.map((section, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-navy text-white text-xs font-semibold flex items-center justify-center"
                aria-hidden
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  {section.label}
                </p>
                {section.isChips && section.chips?.length ? (
                  <div className="flex flex-wrap gap-2 min-w-0">
                    {section.chips.map((topic, j) => (
                      <span
                        key={j}
                        className="inline-flex px-2.5 py-1 rounded-lg bg-primary-blue-50 text-primary-navy text-sm font-medium border border-primary-blue-100"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-800 leading-relaxed">{section.content}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
